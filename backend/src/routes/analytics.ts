import { Router, Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";

export const analyticsRouter = Router();

analyticsRouter.get("/trends", async (req: Request, res: Response) => {
  try {
    const { cardId, months = "12" } = req.query;
    const trends = await analyticsService.getMonthlyTrends(
      cardId as string | undefined,
      Number(months)
    );
    res.json(trends);
  } catch (err) {
    console.error("Trends error:", err);
    res.status(500).json({ error: "שגיאה בטעינת מגמות" });
  }
});

analyticsRouter.get("/categories", async (req: Request, res: Response) => {
  try {
    const { cardId, startDate, endDate } = req.query;
    const breakdown = await analyticsService.getCategoryBreakdown(
      cardId as string | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(breakdown);
  } catch (err) {
    console.error("Category breakdown error:", err);
    res.status(500).json({ error: "שגיאה בטעינת פילוח קטגוריות" });
  }
});

analyticsRouter.get("/merchants", async (req: Request, res: Response) => {
  try {
    const { cardId, limit = "10", startDate, endDate } = req.query;
    const merchants = await analyticsService.getTopMerchants(
      cardId as string | undefined,
      Number(limit),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(merchants);
  } catch (err) {
    console.error("Merchants error:", err);
    res.status(500).json({ error: "שגיאה בטעינת בתי עסק" });
  }
});

analyticsRouter.get("/comparison", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const comparison = await analyticsService.getCardComparison(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(comparison);
  } catch (err) {
    console.error("Comparison error:", err);
    res.status(500).json({ error: "שגיאה בטעינת השוואת כרטיסים" });
  }
});
