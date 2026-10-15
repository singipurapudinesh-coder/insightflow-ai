import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import { requireAuth, AuthRequest } from "./middleware/auth";
import { prisma } from "./config/prisma";
import datasetRoutes from "./routes/datasets";
import aiRoutes from "./routes/ai";
import mlRoutes from "./routes/ml";

dotenv.config();

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? "*",
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "InsightFlow AI API", timestamp: new Date().toISOString() });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected User Route: /api/auth/me
app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.json({
        user: { id: req.userId, name: "Analyst", email: "user@insightflow.ai" }
      });
    }

    res.json({ user });
  } catch (error) {
    res.json({
      user: { id: req.userId, name: "Analyst", email: "user@insightflow.ai" }
    });
  }
});

// Other Business Modules
app.use("/api/datasets", datasetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ml", mlRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`InsightFlow AI API running on port ${PORT}`);
});

export default app;
