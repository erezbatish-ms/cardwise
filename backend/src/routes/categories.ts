import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const categoriesRouter = Router();

categoriesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId: (req as any).userId }] },
      orderBy: { name: "asc" },
      include: { _count: { select: { transactions: true } } },
    });
    res.json(categories);
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json({ error: "שגיאה בטעינת קטגוריות" });
  }
});

categoriesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) {
      res.status(400).json({ error: "נדרש שם קטגוריה" });
      return;
    }

    const category = await prisma.category.create({
      data: { name, icon, color, isDefault: false, userId: (req as any).userId },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: "שגיאה ביצירת קטגוריה" });
  }
});
