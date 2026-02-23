import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency, formatMonth } from "../../lib/utils";
import { Card, CardSkeleton } from "../shared/Card";

export function SpendingTrends() {
  const { data, isLoading, error } = useApi(() => api.getTrends(undefined, 12), []);

  if (isLoading) return <CardSkeleton title="📈 מגמות הוצאות (12 חודשים)" />;
  if (error) return <Card title="📈 מגמות הוצאות"><div className="flex h-[300px] items-center justify-center text-red-500">{error}</div></Card>;

  const chartData = data?.map((t) => ({
    month: formatMonth(t.month),
    total: Math.round(t.total),
    count: t.count,
  }));

  return (
    <Card title="📈 מגמות הוצאות (12 חודשים)">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `₪${v}`} axisLine={{ stroke: "#e2e8f0" }} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "סה״כ"]}
            contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#colorTotal)"
            dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
