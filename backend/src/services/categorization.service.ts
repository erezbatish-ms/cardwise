import { PrismaClient } from "@prisma/client";
import { AzureOpenAI } from "openai";

const prisma = new PrismaClient();

interface UncategorizedTxn {
  id: string;
  description: string;
  chargedAmount: unknown;
  merchant: string | null;
}

class CategorizationService {
  private client: AzureOpenAI;
  private deployment: string;

  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
    });
    this.deployment =
      process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  }

  async categorize(
    transactions: UncategorizedTxn[]
  ): Promise<{ categorized: number; failed: number }> {
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
    const categoryNames = categories.map((c) => c.name).join(", ");

    let categorized = 0;
    let failed = 0;

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      const prompt = `סווג את העסקאות הבאות לקטגוריות. הקטגוריות האפשריות: ${categoryNames}

עסקאות:
${batch.map((t, idx) => `${idx + 1}. "${t.description}" - ${t.chargedAmount} ₪`).join("\n")}

החזר JSON בפורמט: [{"index": 1, "category": "שם הקטגוריה"}]
החזר רק את ה-JSON, ללא טקסט נוסף.`;

      try {
        const response = await this.client.chat.completions.create({
          model: this.deployment,
          messages: [
            {
              role: "system",
              content:
                "אתה מומחה לסיווג עסקאות כרטיס אשראי לקטגוריות הוצאה בעברית. החזר רק JSON תקין.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 1000,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          failed += batch.length;
          continue;
        }

        const results: { index: number; category: string }[] = JSON.parse(content);

        for (const result of results) {
          const txn = batch[result.index - 1];
          const categoryId = categoryMap.get(result.category);
          if (txn && categoryId) {
            await prisma.transaction.update({
              where: { id: txn.id },
              data: { categoryId, categorySource: "ai" },
            });
            categorized++;
          } else {
            failed++;
          }
        }
      } catch (err) {
        console.error("AI categorization batch error:", err);
        failed += batch.length;
      }
    }

    return { categorized, failed };
  }
}

export const categorizationService = new CategorizationService();
