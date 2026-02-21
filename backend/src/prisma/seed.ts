import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444" },
  { name: "סופרמרקט", icon: "🛒", color: "#f97316" },
  { name: "תחבורה", icon: "🚌", color: "#eab308" },
  { name: "דלק", icon: "⛽", color: "#84cc16" },
  { name: "בריאות", icon: "🏥", color: "#22c55e" },
  { name: "ביגוד והנעלה", icon: "👗", color: "#14b8a6" },
  { name: "חינוך", icon: "📚", color: "#06b6d4" },
  { name: "בידור ופנאי", icon: "🎬", color: "#3b82f6" },
  { name: "תקשורת", icon: "📱", color: "#6366f1" },
  { name: "ביטוח", icon: "🛡️", color: "#8b5cf6" },
  { name: "חשבונות ושירותים", icon: "📄", color: "#a855f7" },
  { name: "קניות אונליין", icon: "🛍️", color: "#d946ef" },
  { name: "מתנות", icon: "🎁", color: "#ec4899" },
  { name: "נסיעות וחופשות", icon: "✈️", color: "#f43f5e" },
  { name: "ריהוט ואלקטרוניקה", icon: "🖥️", color: "#78716c" },
  { name: "טיפוח ויופי", icon: "💅", color: "#f472b6" },
  { name: "שונות", icon: "📌", color: "#94a3b8" },
];

async function seed() {
  console.log("Seeding default Hebrew categories...");

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
