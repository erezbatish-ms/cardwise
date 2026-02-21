export const FIXTURES = {
  cards: [
    { id: "1234", lastFourDigits: "1234", cardName: "ויזה", provider: "isracard", createdAt: new Date() },
    { id: "5678", lastFourDigits: "5678", cardName: null, provider: "isracard", createdAt: new Date() },
  ],
  categories: [
    { id: "cat-1", name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", isDefault: true },
    { id: "cat-2", name: "סופרמרקט", icon: "🛒", color: "#f97316", isDefault: true },
    { id: "cat-3", name: "תחבורה", icon: "🚌", color: "#eab308", isDefault: true },
  ],
  transactions: [
    {
      id: "txn-1",
      cardId: "1234",
      date: new Date("2025-12-15"),
      description: "מסעדת שווארמה",
      originalAmount: 85,
      chargedAmount: 85,
      currency: "ILS",
      categoryId: "cat-1",
      categorySource: "ai",
      merchant: "מסעדת שווארמה",
      scraperTxnId: "2025-12-15_85_שווארמה",
      createdAt: new Date(),
    },
  ],
  scrapeAccounts: [
    {
      accountNumber: "1234567890",
      txns: [
        {
          date: "2025-12-15",
          processedDate: "2025-12-17",
          description: "מסעדת שווארמה",
          originalAmount: 85,
          chargedAmount: 85,
          originalCurrency: "ILS",
          identifier: "txn-abc-123",
        },
      ],
    },
  ],
};
