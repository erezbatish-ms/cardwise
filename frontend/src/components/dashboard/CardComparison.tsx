import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../lib/utils";
import { Card, CardSkeleton } from "../shared/Card";

export function CardComparison({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const { data, isLoading, error } = useApi(() => api.getCardComparison(startDate, endDate), [startDate, endDate]);

  if (isLoading) return <CardSkeleton title="💳 השוואת כרטיסים" />;

  if (error) {
    return (
      <Card title="💳 השוואת כרטיסים">
        <div className="flex h-[300px] items-center justify-center text-red-500">{error}</div>
      </Card>
    );
  }

  if (!data || data.length <= 1) {
    return (
      <Card title="💳 השוואת כרטיסים">
        <div className="flex h-[300px] items-center justify-center text-gray-400">
          נדרשים לפחות 2 כרטיסים להשוואה
        </div>
      </Card>
    );
  }

  const chartData = data.map((c) => ({
    name: c.cardName || `****${c.lastFourDigits}`,
    total: Math.round(c.total),
    avg: Math.round(c.avgTransaction),
    count: c.count,
  }));

  return (
    <Card title="💳 השוואת כרטיסים">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `₪${v}`} axisLine={{ stroke: "#e2e8f0" }} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          />
          <Bar dataKey="total" fill="url(#barGradient)" name="סה״כ" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
