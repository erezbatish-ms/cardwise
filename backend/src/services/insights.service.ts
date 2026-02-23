import { PrismaClient } from "@prisma/client";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { analyticsService } from "./analytics.service.js";

const prisma = new PrismaClient();

export interface Insight {
  type: string;
  title: string;
  content: string;
  severity: "info" | "warning" | "tip";
}

class InsightsService {
  private _client: AzureOpenAI | null = null;

  private get client(): AzureOpenAI {
    if (!this._client) {
      if (!process.env.AZURE_OPENAI_ENDPOINT) {
        throw new Error("Azure OpenAI endpoint not configured");
      }
      if (process.env.AZURE_OPENAI_API_KEY) {
        this._client = new AzureOpenAI({
          endpoint: process.env.AZURE_OPENAI_ENDPOINT,
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview",
        });
      } else {
        const credential = new DefaultAzureCredential();
        const scope = "https://cognitiveservices.azure.com/.default";
        const azureADTokenProvider = getBearerTokenProvider(credential, scope);
        this._client = new AzureOpenAI({
          endpoint: process.env.AZURE_OPENAI_ENDPOINT,
          azureADTokenProvider,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview",
        });
      }
    }
    return this._client;
  }

  private get deployment(): string {
    return process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
  }

  async getInsights(userId: string, cardId?: string, period?: string): Promise<Insight[]> {
    const cardScope = cardId || "all";
    const currentPeriod =
      period ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    // Check cache
    const cached = await prisma.insightCache.findUnique({
      where: {
        userId_type_cardScope_period: {
          userId,
          type: "monthly_tips",
          cardScope,
          period: currentPeriod,
        },
      },
    });

    if (cached && new Date(cached.expiresAt) > new Date()) {
      return JSON.parse(cached.content);
    }

    return this.generateInsights(userId, cardId, period);
  }

  async generateInsights(
    userId: string,
    cardId?: string,
    period?: string
  ): Promise<Insight[]> {
    const cardScope = cardId || "all";
    const currentPeriod =
      period ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    // Gather analytics data for context
    const [trends, categories, merchants] = await Promise.all([
      analyticsService.getMonthlyTrends(userId, cardId, 6),
      analyticsService.getCategoryBreakdown(userId, cardId),
      analyticsService.getTopMerchants(userId, cardId, 5),
    ]);

    const prompt = `אתה יועץ פיננסי אישי. נתח את נתוני ההוצאות הבאים ותן טיפים מעשיים לחיסכון.

מגמות חודשיות (6 חודשים אחרונים):
${trends.map((t) => `${t.month}: ${t.total.toFixed(0)} ₪ (${t.count} עסקאות)`).join("\n")}

פילוח לפי קטגוריות:
${categories.map((c) => `${c.categoryName}: ${c.total.toFixed(0)} ₪ (${c.percentage.toFixed(1)}%)`).join("\n")}

בתי עסק מובילים:
${merchants.map((m) => `${m.merchant}: ${m.total.toFixed(0)} ₪ (${m.count} עסקאות)`).join("\n")}

החזר JSON עם מערך של תובנות בפורמט:
[
  {
    "type": "trend|category|tip|warning",
    "title": "כותרת קצרה",
    "content": "תוכן מפורט עם טיפ מעשי",
    "severity": "info|warning|tip"
  }
]

תן 4-6 תובנות מגוונות. החזר רק JSON תקין.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.deployment,
        messages: [
          {
            role: "system",
            content:
              "אתה יועץ פיננסי מומחה שמנתח הוצאות כרטיס אשראי ונותן טיפים מעשיים בעברית. החזר רק JSON תקין.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const rawContent = response.choices[0]?.message?.content?.trim();
      if (!rawContent) return this.getDefaultInsights();

      // Strip markdown code fences if present
      const content = rawContent.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      const insights: Insight[] = JSON.parse(content);

      // Cache for 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.insightCache.upsert({
        where: {
          userId_type_cardScope_period: {
            userId,
            type: "monthly_tips",
            cardScope,
            period: currentPeriod,
          },
        },
        update: { content: JSON.stringify(insights), expiresAt },
        create: {
          type: "monthly_tips",
          cardScope,
          period: currentPeriod,
          content: JSON.stringify(insights),
          expiresAt,
          userId,
        },
      });

      return insights;
    } catch (err) {
      console.error("AI insights generation error:", err);
      return this.getDefaultInsights();
    }
  }

  private getDefaultInsights(): Insight[] {
    return [
      {
        type: "tip",
        title: "לא ניתן לייצר תובנות כרגע",
        content: "נסה שוב מאוחר יותר או בדוק את הגדרות Azure OpenAI",
        severity: "info",
      },
    ];
  }
}

export const insightsService = new InsightsService();
