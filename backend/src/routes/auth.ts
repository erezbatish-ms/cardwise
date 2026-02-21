import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";

export const authRouter = Router();

const SALT_ROUNDS = 12;

// On first run, hash the APP_PASSWORD env var
let hashedPassword: string | null = null;

async function getHashedPassword(): Promise<string> {
  if (!hashedPassword) {
    const raw = process.env.APP_PASSWORD;
    if (!raw) throw new Error("APP_PASSWORD environment variable is required");
    hashedPassword = await bcrypt.hash(raw, SALT_ROUNDS);
  }
  return hashedPassword;
}

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "נדרשת סיסמה" });
      return;
    }

    const hash = await getHashedPassword();
    const valid = await bcrypt.compare(password, hash);

    if (!valid) {
      res.status(401).json({ error: "סיסמה שגויה" });
      return;
    }

    req.session.authenticated = true;
    res.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "שגיאה בהתנתקות" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

authRouter.get("/status", (req: Request, res: Response) => {
  res.json({ authenticated: !!req.session.authenticated });
});
