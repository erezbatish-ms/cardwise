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

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">לוח בקרה</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingTrends />
        <CategoryBreakdown />
        <TopMerchants />
        <CardComparison />
      </div>
      <AiInsights />
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
