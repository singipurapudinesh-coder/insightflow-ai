import { Router, Request, Response } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { profileDataset } from "../utils/dataProcessor";

const router = Router();
const upload = multer({ dest: "uploads/" });

// In-Memory store for active session datasets
export const datasetStore = new Map<string, {
  id: string;
  fileName: string;
  rows: Record<string, any>[];
  profile: ReturnType<typeof profileDataset>;
  createdAt: string;
}>();

// Helper to seed demo data if available
function loadDemoDataset(): boolean {
  if (datasetStore.has("demo")) return true;

  const sampleCsvPath = path.resolve(__dirname, "../../../sample_data/superstore_sales.csv");
  if (fs.existsSync(sampleCsvPath)) {
    const csvContent = fs.readFileSync(sampleCsvPath, "utf-8");
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const rows = parsed.data as Record<string, any>[];
    const profile = profileDataset(rows);

    datasetStore.set("demo", {
      id: "demo",
      fileName: "superstore_sales.csv",
      rows,
      profile,
      createdAt: new Date().toISOString()
    });
    return true;
  }
  return false;
}

// 1. Upload CSV or Excel file
router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows: Record<string, any>[] = [];

    if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      const fileContent = fs.readFileSync(req.file.path, "utf-8");
      const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      rows = parsed.data as Record<string, any>[];
    }

    // Clean up temporary disk file
    fs.unlinkSync(req.file.path);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Uploaded file contains no readable data." });
    }

    const id = `ds_${Date.now()}`;
    const profile = profileDataset(rows);

    datasetStore.set(id, {
      id,
      fileName: req.file.originalname,
      rows,
      profile,
      createdAt: new Date().toISOString()
    });

    return res.json({
      id,
      fileName: req.file.originalname,
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      columns: profile.columns,
      kpis: profile.kpis,
      preview: rows.slice(0, 10),
      sample3DData: profile.sample3DData
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: "File processing failed: " + error.message });
  }
});

// 2. Load Superstore Demo Dataset
router.get("/demo", (req: Request, res: Response) => {
  loadDemoDataset();
  const ds = datasetStore.get("demo");
  if (!ds) {
    return res.status(404).json({ error: "Demo dataset not found" });
  }

  return res.json({
    id: ds.id,
    fileName: ds.fileName,
    rowCount: ds.profile.rowCount,
    columnCount: ds.profile.columnCount,
    columns: ds.profile.columns,
    kpis: ds.profile.kpis,
    preview: ds.rows.slice(0, 15),
    sample3DData: ds.profile.sample3DData
  });
});

// 3. Get Dataset Profile & Metadata
router.get("/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === "demo") loadDemoDataset();

  const ds = datasetStore.get(id);
  if (!ds) {
    return res.status(404).json({ error: "Dataset not found" });
  }

  return res.json({
    id: ds.id,
    fileName: ds.fileName,
    rowCount: ds.profile.rowCount,
    columnCount: ds.profile.columnCount,
    columns: ds.profile.columns,
    kpis: ds.profile.kpis,
    preview: ds.rows.slice(0, 15),
    sample3DData: ds.profile.sample3DData
  });
});

// 4. Get 3D Visualizer Scene Data
router.get("/:id/3d-data", (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === "demo") loadDemoDataset();

  const ds = datasetStore.get(id);
  if (!ds) {
    return res.status(404).json({ error: "Dataset not found" });
  }

  return res.json({
    datasetId: id,
    title: `3D Revenue & Performance Scene: ${ds.fileName}`,
    cubes: ds.profile.sample3DData,
    kpis: ds.profile.kpis
  });
});

export default router;

