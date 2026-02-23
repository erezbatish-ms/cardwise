const API_BASE = "/api";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "שגיאת שרת" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth — OAuth redirect-based login
  authStatus: () =>
    fetchApi<{ authenticated: boolean; user?: AuthUser }>("/auth/status"),
  authProviders: () =>
    fetchApi<{ providers: string[] }>("/auth/providers"),
  logout: () =>
    fetchApi<{ success: boolean }>("/auth/logout", { method: "POST" }),

  // Scrape
  scrape: (id: string, card6Digits: string, password: string, startDate?: string) =>
    fetchApi<{ status: string; message: string }>("/scrape", {
      method: "POST",
      body: JSON.stringify({ id, card6Digits, password, startDate }),
    }),

  // Cards
  getCards: () => fetchApi<Card[]>("/cards"),
  updateCard: (id: string, cardName: string) =>
    fetchApi<Card>(`/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify({ cardName }),
    }),

  // Transactions
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return fetchApi<TransactionsResponse>(`/transactions${qs}`);
  },
  updateCategory: (txnId: string, categoryId: string) =>
    fetchApi(`/transactions/${txnId}/category`, {
      method: "PUT",
      body: JSON.stringify({ categoryId }),
    }),
  triggerCategorize: () =>
    fetchApi<{ message: string }>("/transactions/categorize", {
      method: "POST",
    }),

  // Categories
  getCategories: () => fetchApi<Category[]>("/categories"),
  createCategory: (name: string, icon?: string, color?: string) =>
    fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify({ name, icon, color }),
    }),

  // Analytics
  getTrends: (cardId?: string, months?: number) => {
    const params = new URLSearchParams();
    if (cardId) params.set("cardId", cardId);
    if (months) params.set("months", String(months));
    return fetchApi<MonthlyTrend[]>(`/analytics/trends?${params}`);
  },
  getCategoryBreakdown: (cardId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (cardId) params.set("cardId", cardId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return fetchApi<CategoryBreakdown[]>(`/analytics/categories?${params}`);
  },
  getTopMerchants: (cardId?: string, limit?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (cardId) params.set("cardId", cardId);
    if (limit) params.set("limit", String(limit));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return fetchApi<MerchantSummary[]>(`/analytics/merchants?${params}`);
  },
  getCardComparison: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return fetchApi<CardComparisonItem[]>(`/analytics/comparison?${params}`);
  },

  // Insights
  getInsights: (cardId?: string, period?: string) => {
    const params = new URLSearchParams();
    if (cardId) params.set("cardId", cardId);
    if (period) params.set("period", period);
    return fetchApi<Insight[]>(`/insights?${params}`);
  },
  refreshInsights: (cardId?: string, period?: string) =>
    fetchApi<Insight[]>("/insights/refresh", {
      method: "POST",
      body: JSON.stringify({ cardId, period }),
    }),
};

// Types
export interface Card {
  id: string;
  lastFourDigits: string;
  cardName: string | null;
  provider: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Transaction {
  id: string;
  cardId: string;
  date: string;
  description: string;
  originalAmount: number;
  chargedAmount: number;
  currency: string;
  categoryId: string | null;
  categorySource: string;
  merchant: string | null;
  card: Card;
  category: Category | null;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

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

export interface Insight {
  type: string;
  title: string;
  content: string;
  severity: "info" | "warning" | "tip";
}
