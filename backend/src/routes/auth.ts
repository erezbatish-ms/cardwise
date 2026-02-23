import { Router, Request, Response } from "express";
import passport from "passport";
import type { SerializedUser } from "../auth/passport.js";

export const authRouter = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Guard: redirect with error if strategy isn't configured
function requireStrategy(provider: string) {
  return (req: Request, res: Response, next: Function) => {
    if ((passport as any)._strategy(provider)) {
      next();
    } else {
      res.redirect(`${FRONTEND_URL}/login?error=${provider}_not_configured`);
    }
  };
}

// --- Google OAuth ---
authRouter.get("/google", requireStrategy("google"), passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
  "/google/callback",
  requireStrategy("google"),
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req: Request, res: Response) => {
    res.redirect(FRONTEND_URL);
  }
);

// --- Microsoft OAuth ---
authRouter.get("/microsoft", requireStrategy("microsoft"), passport.authenticate("microsoft", { prompt: "select_account" }));

authRouter.get(
  "/microsoft/callback",
  requireStrategy("microsoft"),
  passport.authenticate("microsoft", { failureRedirect: `${FRONTEND_URL}/login?error=microsoft_failed` }),
  (req: Request, res: Response) => {
    res.redirect(FRONTEND_URL);
  }
);

// --- Facebook OAuth ---
authRouter.get("/facebook", requireStrategy("facebook"), passport.authenticate("facebook", { scope: ["email"] }));

authRouter.get(
  "/facebook/callback",
  requireStrategy("facebook"),
  passport.authenticate("facebook", { failureRedirect: `${FRONTEND_URL}/login?error=facebook_failed` }),
  (req: Request, res: Response) => {
    res.redirect(FRONTEND_URL);
  }
);

// --- Status ---
authRouter.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as SerializedUser;
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

// --- Logout ---
authRouter.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: "שגיאה בהתנתקות" });
      return;
    }
    req.session.destroy((err2) => {
      if (err2) {
        res.status(500).json({ error: "שגיאה בהתנתקות" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

// --- Available Providers ---
authRouter.get("/providers", (_req: Request, res: Response) => {
  const providers: string[] = [];
  if (process.env.GOOGLE_CLIENT_ID) providers.push("google");
  if (process.env.MICROSOFT_CLIENT_ID) providers.push("microsoft");
  if (process.env.FACEBOOK_CLIENT_ID) providers.push("facebook");
  res.json({ providers });
});

// --- Test-only login (development only) ---
if (process.env.NODE_ENV !== "production") {
  authRouter.post("/test-login", async (req: Request, res: Response) => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      // Use the legacy user (which owns existing data) or create a test user
      let user = await prisma.user.findFirst({
        where: { email: { in: ["legacy@cardwise.local", "test@cardwise.local"] } },
      });
      if (!user) {
        user = await prisma.user.create({
          data: { email: "test@cardwise.local", displayName: "Test User" },
        });
      }
      const serializedUser: SerializedUser = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      };
      req.login(serializedUser, (err) => {
        if (err) {
          res.status(500).json({ error: "Login failed" });
          return;
        }
        res.json({ success: true, user: serializedUser });
      });
    } catch (err) {
      console.error("Test login error:", err);
      res.status(500).json({ error: "Test login failed" });
    } finally {
      await prisma.$disconnect();
    }
  });
}
