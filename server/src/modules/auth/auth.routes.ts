import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_insightflow_jwt_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// In-Memory fallback store if PostgreSQL is still being provisioned
const memoryUsers = new Map<string, { id: string; name: string; email: string; passwordHash: string; workspaceId: string }>();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid registration details",
      });
    }

    const { name, email, password } = parsed.data;

    try {
      // 1. Try PostgreSQL via Prisma
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      const token = jwt.sign(
        { userId: user.id, workspaceId: workspace.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      return res.status(201).json({
        accessToken: token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (dbError) {
      // Graceful fallback to memory store if local PostgreSQL is unconfigured
      const lowerEmail = email.toLowerCase();
      if (memoryUsers.has(lowerEmail)) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}`;
      const workspaceId = `ws_${Date.now()}`;

      memoryUsers.set(lowerEmail, {
        id: userId,
        name,
        email: lowerEmail,
        passwordHash,
        workspaceId
      });

      const token = jwt.sign(
        { userId, workspaceId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      return res.status(201).json({
        accessToken: token,
        user: { id: userId, name, email: lowerEmail },
      });
    }
  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Registration failed: " + error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message || "Invalid login details",
      });
    }

    const { email, password } = parsed.data;

    try {
      // 1. Try PostgreSQL via Prisma
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
      });

      const token = jwt.sign(
        { userId: user.id, workspaceId: membership?.workspaceId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      return res.json({
        accessToken: token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (dbError) {
      // Fallback check in memory
      const lowerEmail = email.toLowerCase();
      const memUser = memoryUsers.get(lowerEmail);
      if (!memUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, memUser.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: memUser.id, workspaceId: memUser.workspaceId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      return res.json({
        accessToken: token,
        user: { id: memUser.id, name: memUser.name, email: memUser.email },
      });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Login failed: " + error.message });
  }
});

export default router;
