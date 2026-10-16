"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Database,
  ArrowRight,
  Sparkles,
  FileText,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { uploadDataset, getDatasetProfile, resetDataset, DatasetProfile } from "@/lib/api";

export default function AnalyzePage() {
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getDatasetProfile();
      setProfile(data);
      setErrorMessage(null);
    } catch (e: any) {
      console.warn("Could not reach backend profile endpoint:", e);
      // Fallback preview if backend is offline
      setProfile({
        filename: "sales_sample.csv",
        total_rows: 600,
        total_columns: 17,
        columns: [
          { name: "order_id", dtype: "object", missing_count: 0, missing_pct: 0, unique_count: 600, sample_values: ["IN-2025-1279", "IN-2025-1522"] },
          { name: "order_date", dtype: "datetime64[ns]", missing_count: 0, missing_pct: 0, unique_count: 180, sample_values: ["2025-01-01", "2025-01-02"] },
          { name: "region", dtype: "object", missing_count: 0, missing_pct: 0, unique_count: 4, sample_values: ["Central", "West", "East"] },
          { name: "category", dtype: "object", missing_count: 0, missing_pct: 0, unique_count: 3, sample_values: ["Furniture", "Office Supplies", "Technology"] },
          { name: "sales", dtype: "float64", missing_count: 0, missing_pct: 0, unique_count: 588, sample_values: [467.2, 1038.89, 1551.86] },
          { name: "profit", dtype: "float64", missing_count: 0, missing_pct: 0, unique_count: 574, sample_values: [5.29, 137.85, 479.98] },
          { name: "quantity", dtype: "int64", missing_count: 0, missing_pct: 0, unique_count: 14, sample_values: [3, 8, 4] },
        ],
        quality_score: 99.8,
        preview_rows: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".csv", ".xlsx", ".xls"].includes(ext)) {
      setErrorMessage(`Unsupported file format '${ext}'. Please upload a CSV or Excel (.xlsx, .xls) file.`);
      setSuccessMessage(null);
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await uploadDataset(file);
      setProfile(res.profile);
      setSuccessMessage(`Dataset "${res.filename}" successfully loaded! (${res.row_count} rows, ${res.column_count} columns)`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload dataset. Ensure the backend is running at http://localhost:8000.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleReset = async () => {
    if (!window.confirm("Remove current uploaded dataset and reset to sample dataset?")) return;
    setLoading(true);
    try {
      const res = await resetDataset();
      setProfile(res.profile);
      setSuccessMessage("Dataset removed successfully. Reset to default sample dataset.");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Data Profiling & Quality Audit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated schema inspection, column types, and data hygiene metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfile}
              disabled={loading || uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
              <span>Reload Audit</span>
            </button>

            <button
              onClick={handleReset}
              disabled={loading || uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Remove dataset and start fresh"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Dataset</span>
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv, .xlsx, .xls"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Upload Zone */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.005]"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-400"
          }`}
        >
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-sm">
            {uploading ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            {uploading ? "Ingesting & Analyzing Dataset..." : "Upload new CSV or Excel file"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {uploading
              ? "Pandas is parsing schema, validating dtypes, and computing summary statistics."
              : "Drag and drop your spreadsheet here or click to browse. Max size 25MB (.csv, .xlsx, .xls)."}
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              CSV Format
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Excel (.xlsx, .xls)
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 shadow-sm"
            >
              <span>View in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-semibold underline ml-4 hover:text-rose-900 dark:hover:text-rose-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Data Quality Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Data Quality Score
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {profile ? `${profile.quality_score}%` : "100.0%"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data completeness: {profile?.completeness_pct !== undefined ? `${profile.completeness_pct}%` : "100%"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Dataset Records
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {profile ? profile.total_rows.toLocaleString() : "600"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active dataset: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.filename || "sales_sample.csv"}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Columns Detected
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {profile ? profile.total_columns : "17"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Numerical, categorical & temporal</p>
          </div>
        </div>

        {/* Mathematical Quality Score Audit Card */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Data Quality & Hygiene Audit Formula
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {profile?.formula_documentation || "Quality Score = max(0, 100 - (missing_cells / total_cells * 100))"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Total Cells: </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile?.total_cells?.toLocaleString() ?? ((profile?.total_rows ?? 600) * (profile?.total_columns ?? 17)).toLocaleString()}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Missing Nulls: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {profile?.total_missing_cells ?? 0}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
                {profile?.completeness_pct ?? 100}% Cleanliness
              </div>
            </div>
          </div>
        </div>

        {/* Column Profiler Table */}
        {profile?.columns && (
          <div className="mt-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Schema & Missing Values Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed inspection of column data types, missing rates, and sample values
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {profile.columns.length} columns inspected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Inferred Type</th>
                    <th className="py-2.5 px-3">Missing Count</th>
                    <th className="py-2.5 px-3">Missing %</th>
                    <th className="py-2.5 px-3">Unique Values</th>
                    <th className="py-2.5 px-3">Sample Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {profile.columns.map((col: any) => (
                    <tr key={col.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {col.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {col.dtype}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {col.missing_count}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={col.missing_pct > 0 ? "text-amber-500 font-medium" : "text-emerald-600 font-medium"}>
                          {col.missing_pct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {col.unique_count.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                        {Array.isArray(col.sample_values) ? col.sample_values.join(", ") : String(col.sample_values)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
