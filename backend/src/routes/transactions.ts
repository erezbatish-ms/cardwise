import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const transactionsRouter = Router();

transactionsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const {
      cardId,
      categoryId,
      startDate,
      endDate,
      search,
      page = "1",
      limit = "50",
    } = req.query;

    const where: Record<string, unknown> = {};

    if (cardId) where.cardId = cardId as string;
    if (categoryId) where.categoryId = categoryId as string;
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate as string) } : {}),
        ...(endDate ? { lte: new Date(endDate as string) } : {}),
      };
    }
    if (search) {
      where.description = { contains: search as string, mode: "insensitive" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { card: true, category: true },
        orderBy: { date: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Transactions error:", err);
    res.status(500).json({ error: "שגיאה בטעינת עסקאות" });
  }
});

transactionsRouter.put("/:id/category", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { categoryId } = req.body;

    // Update the single transaction
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        categoryId,
        categorySource: "manual",
      },
      include: { category: true },
    });

    // Also update all other transactions from the same merchant
    let merchantUpdated = 0;
    if (updated.merchant) {
      const result = await prisma.transaction.updateMany({
        where: {
          merchant: updated.merchant,
          id: { not: id },
        },
        data: {
          categoryId,
          categorySource: "manual",
        },
      });
      merchantUpdated = result.count;
    }

    res.json({ ...updated, merchantUpdated });
  } catch (err) {
    console.error("Category update error:", err);
    res.status(500).json({ error: "שגיאה בעדכון קטגוריה" });
  }
});

transactionsRouter.post("/categorize", async (req: Request, res: Response) => {
  try {
    const { categorizationService } = await import(
      "../services/categorization.service.js"
    );
    const uncategorized = await prisma.transaction.findMany({
      where: {
        OR: [
          { categoryId: null },
          { categorySource: "ai" },
        ],
      },
      select: { id: true, description: true, chargedAmount: true, merchant: true },
    });

    if (uncategorized.length === 0) {
      res.json({ message: "כל העסקאות כבר מסווגות", categorized: 0 });
      return;
    }

    const result = await categorizationService.categorize(uncategorized);
    res.json({
      message: `סווגו ${result.categorized} עסקאות`,
      ...result,
    });
  } catch (err) {
    console.error("Categorization error:", err);
    res.status(500).json({ error: "שגיאה בסיווג עסקאות" });
  }
});
