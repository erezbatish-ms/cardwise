import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface MonthlyTrend {
  month: string;
  total: number;
  count: number;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  icon: string | null;
  color: string | null;
  total: number;
  count: number;
  percentage: number;
}

export interface MerchantSummary {
  merchant: string;
  total: number;
  count: number;
}

export interface CardComparisonItem {
  cardId: string;
  cardName: string | null;
  lastFourDigits: string;
  total: number;
  count: number;
  avgTransaction: number;
}

class AnalyticsService {
  async getMonthlyTrends(
    userId: string,
    cardId?: string,
    months: number = 12
  ): Promise<MonthlyTrend[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const where: Prisma.TransactionWhereInput = {
      userId,
      date: { gte: startDate },
      ...(cardId ? { cardId } : {}),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      select: { date: true, chargedAmount: true },
      orderBy: { date: "asc" },
    });

    const monthMap = new Map<string, { total: number; count: number }>();
    for (const txn of transactions) {
      const key = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, "0")}`;
      const current = monthMap.get(key) || { total: 0, count: 0 };
      // Sum raw amounts: negatives (charges) and positives (refunds) net out
      current.total += Number(txn.chargedAmount);
      current.count++;
      monthMap.set(key, current);
    }

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, total: Math.abs(data.total), count: data.count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getCategoryBreakdown(
    userId: string,
    cardId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CategoryBreakdown[]> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(cardId ? { cardId } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const results = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where,
      _sum: { chargedAmount: true },
      _count: true,
    });

    const categories = await prisma.category.findMany();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const grandTotal = results.reduce(
      (sum, r) => sum + Math.abs(Number(r._sum.chargedAmount || 0)),
      0
    );

    return results
      .map((r) => {
        const cat = r.categoryId ? catMap.get(r.categoryId) : null;
        const total = Math.abs(Number(r._sum.chargedAmount || 0));
        return {
          categoryId: r.categoryId,
          categoryName: cat?.name || "לא מסווג",
          icon: cat?.icon || null,
          color: cat?.color || "#94a3b8",
          total,
          count: r._count,
          percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  async getTopMerchants(
    userId: string,
    cardId?: string,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<MerchantSummary[]> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      merchant: { not: null },
      ...(cardId ? { cardId } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const results = await prisma.transaction.groupBy({
      by: ["merchant"],
      where,
      _sum: { chargedAmount: true },
      _count: true,
      orderBy: { _sum: { chargedAmount: "asc" } },
      take: limit,
    });

    return results.map((r) => ({
      merchant: r.merchant || "",
      total: Math.abs(Number(r._sum.chargedAmount || 0)),
      count: r._count,
    }));
  }

  async getCardComparison(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CardComparisonItem[]> {
    const dateFilter = startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const cards = await prisma.card.findMany({
      where: { userId },
      include: {
        transactions: {
          where: { userId, ...dateFilter },
          select: { chargedAmount: true },
        },
      },
    });

    return cards.map((card) => {
      // Sum raw amounts (negatives net against positives/refunds)
      const rawTotal = card.transactions.reduce(
        (sum, t) => sum + Number(t.chargedAmount),
        0
      );
      const total = Math.abs(rawTotal);
      const count = card.transactions.length;
      return {
        cardId: card.id,
        cardName: card.cardName,
        lastFourDigits: card.lastFourDigits,
        total,
        count,
        avgTransaction: count > 0 ? total / count : 0,
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
