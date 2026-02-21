import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { scrapeRouter } from "./routes/scrape.js";
import { transactionsRouter } from "./routes/transactions.js";
import { categoriesRouter } from "./routes/categories.js";
import { cardsRouter } from "./routes/cards.js";
import { analyticsRouter } from "./routes/analytics.js";
import { insightsRouter } from "./routes/insights.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "lax",
    },
  })
);

// Public routes
app.use("/api/auth", authRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Protected routes
app.use("/api/scrape", authMiddleware, scrapeRouter);
app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/categories", authMiddleware, categoriesRouter);
app.use("/api/cards", authMiddleware, cardsRouter);
app.use("/api/analytics", authMiddleware, analyticsRouter);
app.use("/api/insights", authMiddleware, insightsRouter);

app.listen(PORT, () => {
  console.log(`CardWise backend running on port ${PORT}`);
});

export default app;
