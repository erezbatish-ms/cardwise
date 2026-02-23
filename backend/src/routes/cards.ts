import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const cardsRouter = Router();

cardsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const cards = await prisma.card.findMany({
      where: { userId: (req as any).userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { transactions: true } } },
    });
    res.json(cards);
  } catch (err) {
    console.error("Cards error:", err);
    res.status(500).json({ error: "שגיאה בטעינת כרטיסים" });
  }
});

cardsRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { cardName } = req.body;

    const updated = await prisma.card.update({
      where: { id, userId: (req as any).userId },
      data: { cardName },
    });
    res.json(updated);
  } catch (err) {
    console.error("Card update error:", err);
    res.status(500).json({ error: "שגיאה בעדכון כרטיס" });
  }
});
