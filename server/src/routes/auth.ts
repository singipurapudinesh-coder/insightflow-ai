import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_insightflow_jwt_key_2026";

// Demo user store
const users = [
  {
    id: "usr_demo",
    email: "student@insightflow.ai",
    passwordHash: bcrypt.hashSync("student123", 8),
    name: "Final Year Student"
  }
];

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    // For demo convenience, let any user authenticate
    const token = jwt.sign({ id: `usr_${Date.now()}`, email, name: email.split("@")[0] }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: { id: `usr_${Date.now()}`, email, name: email.split("@")[0] }
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

router.post("/register", (req: Request, res: Response) => {
  const { email, password, name = "Analyst" } = req.body;
  const token = jwt.sign({ id: `usr_${Date.now()}`, email, name }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: `usr_${Date.now()}`, email, name }
  });
});

export default router;

