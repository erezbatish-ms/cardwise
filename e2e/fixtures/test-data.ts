export const TEST_CATEGORIES = [
  { name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444" },
  { name: "סופרמרקט", icon: "🛒", color: "#f97316" },
  { name: "תחבורה", icon: "🚌", color: "#eab308" },
];

export const TEST_TRANSACTIONS = [
  {
    description: "מסעדת שווארמה",
    chargedAmount: 85,
    date: "2025-12-15",
    category: "מזון ומסעדות",
  },
  {
    description: "רמי לוי",
    chargedAmount: 350,
    date: "2025-12-10",
    category: "סופרמרקט",
  },
  {
    description: "דן אוטובוסים",
    chargedAmount: 12,
    date: "2025-12-08",
    category: "תחבורה",
  },
];

export const TEST_INSIGHTS = [
  {
    type: "tip",
    title: "חסכו במזון",
    content: "ההוצאה על מזון ומסעדות עלתה ב-15% החודש. נסו לבשל יותר בבית.",
    severity: "tip" as const,
  },
  {
    type: "warning",
    title: "עלייה בהוצאות",
    content: "סך ההוצאות החודש גבוה ב-20% מהממוצע.",
    severity: "warning" as const,
  },
];
