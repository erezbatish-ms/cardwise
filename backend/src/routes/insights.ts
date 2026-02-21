import { Router, Request, Response } from "express";
import { aiRateLimit } from "../middleware/security.middleware.js";
import { insightsService } from "../services/insights.service.js";

export const insightsRouter = Router();

insightsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { cardId, period } = req.query;
    const insights = await insightsService.getInsights(
      cardId as string | undefined,
      period as string | undefined
    );
    res.json(insights);
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "שגיאה בטעינת תובנות" });
  }
});

insightsRouter.post("/refresh", aiRateLimit, async (req: Request, res: Response) => {
  try {
    const { cardId, period } = req.body;
    const insights = await insightsService.generateInsights(
      cardId as string | undefined,
      period as string | undefined
    );
    res.json(insights);
  } catch (err) {
    console.error("Insights refresh error:", err);
    res.status(500).json({ error: "שגיאה ביצירת תובנות" });
  }
});
