import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session.authenticated) {
    res.status(401).json({ error: "לא מורשה — נדרשת התחברות" });
    return;
  }
  next();
}
