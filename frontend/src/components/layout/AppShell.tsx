import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "./Sidebar";

// Lazy imports for pages
import { SpendingTrends } from "../dashboard/SpendingTrends";
import { CategoryBreakdown } from "../dashboard/CategoryBreakdown";
import { CardComparison } from "../dashboard/CardComparison";
import { TopMerchants } from "../dashboard/TopMerchants";
import { AiInsights } from "../dashboard/AiInsights";
import { TransactionList } from "../transactions/TransactionList";
import { ScrapeForm } from "../scrape/ScrapeForm";

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [{ value: "", label: "כל התקופה" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("he-IL", { year: "numeric", month: "long" }).format(d);
    options.push({ value, label });
  }
  return options;
}

function getMonthRange(month: string): { startDate?: string; endDate?: string; period?: string } {
  if (!month) return {};
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    period: month,
  };
}

function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const { startDate, endDate, period } = getMonthRange(selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">לוח בקרה</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-label="סנן לפי חודש"
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <SpendingTrends />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryBreakdown startDate={startDate} endDate={endDate} />
        <TopMerchants startDate={startDate} endDate={endDate} />
        <CardComparison startDate={startDate} endDate={endDate} />
      </div>
      <AiInsights period={period} />
    </div>
  );
}

export function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/scrape" element={<ScrapeForm />} />
        </Routes>
      </main>
    </div>
  );
}
