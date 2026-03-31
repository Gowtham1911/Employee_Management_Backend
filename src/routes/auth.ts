import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../models/User";
import { signToken } from "../lib/jwt";
import { authenticate, requireAdmin, AuthRequest } from "../lib/auth";

const router = Router();

router.post("/password/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const user = await findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(200).json({ token, role: user.role });
});

router.post("/password/register", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  await createUser(email, hashedPassword, role === "admin" ? "admin" : "employee");
  res.status(201).json({ message: "Account created successfully" });
});

router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
});

router.get("/user-by-email", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { email } = req.query;
  if (!email) { res.status(400).json({ message: "Email required" }); return; }
  const user = await findUserByEmail(email as string);
  if (!user) { res.status(404).json({ message: "Not found" }); return; }
  res.status(200).json({ id: user.id, email: user.email, role: user.role });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logged out" });
});

export default router;
