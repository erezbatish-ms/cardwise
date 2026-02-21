import rateLimit from "express-rate-limit";

// Stricter rate limit for scrape endpoints
export const scrapeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "יותר מדי בקשות סריקה — נסה שוב מאוחר יותר" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for AI endpoints
export const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 30 : 60,
  message: { error: "יותר מדי בקשות AI — נסה שוב מאוחר יותר" },
  standardHeaders: true,
  legacyHeaders: false,
});
