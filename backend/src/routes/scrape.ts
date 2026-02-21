import { Router, Request, Response } from "express";
import { scrapeRateLimit } from "../middleware/security.middleware.js";
import { scraperService } from "../services/scraper.service.js";
import { transactionService } from "../services/transaction.service.js";

export const scrapeRouter = Router();

scrapeRouter.use(scrapeRateLimit);

interface ScrapeRequest {
  id: string;
  card6Digits: string;
  password: string;
  startDate?: string;
}

scrapeRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { id, card6Digits, password, startDate } = req.body as ScrapeRequest;

    if (!id || !card6Digits || !password) {
      res
        .status(400)
        .json({ error: "נדרשים תעודת זהות, 6 ספרות אחרונות של הכרטיס וסיסמה" });
      return;
    }

    // Default: 6 months back
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    res.json({ status: "scraping", message: "מתחיל סריקה..." });

    // Run scrape in background (credentials only in memory, never persisted)
    const result = await scraperService.scrape({
      id,
      card6Digits,
      password,
      startDate: start,
    });

    if (result.success) {
      const stored = await transactionService.storeTransactions(result.accounts);
      res.json({
        status: "success",
        message: `נסרקו ${stored.totalTransactions} עסקאות מ-${stored.cardCount} כרטיסים`,
        details: stored,
      });
    } else {
      res.status(422).json({
        status: "failed",
        error: result.errorMessage || "סריקה נכשלה",
        errorType: result.errorType,
      });
    }
  } catch (err) {
    console.error("Scrape error:", err);
    res.status(500).json({ error: "שגיאה בסריקה" });
  }
});
