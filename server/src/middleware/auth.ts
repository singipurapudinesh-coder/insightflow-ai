import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  workspaceId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret_insightflow_jwt_key_2026") as {
      userId: string;
      workspaceId?: string;
    };
    req.userId = decoded.userId;
    req.workspaceId = decoded.workspaceId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

