import { Request, Response, NextFunction } from "express";
import type { SerializedUser } from "../auth/passport.js";

declare global {
  namespace Express {
    interface User extends SerializedUser {}
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: "לא מורשה — נדרשת התחברות" });
    return;
  }
  // Attach userId for convenience in route handlers
  (req as any).userId = (req.user as SerializedUser).id;
  next();
}
