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

export function CardComparison({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const { data, isLoading, error } = useApi(() => api.getCardComparison(startDate, endDate), [startDate, endDate]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">💳 השוואת כרטיסים</h3>
        <div className="flex h-[300px] items-center justify-center text-gray-400">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">💳 השוואת כרטיסים</h3>
        <div className="flex h-[300px] items-center justify-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!data || data.length <= 1) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">💳 השוואת כרטיסים</h3>
        <div className="flex h-[300px] items-center justify-center text-gray-400">
          נדרשים לפחות 2 כרטיסים להשוואה
        </div>
      </div>
    );
  }

  const chartData = data.map((c) => ({
    name: c.cardName || `****${c.lastFourDigits}`,
    total: Math.round(c.total),
    avg: Math.round(c.avgTransaction),
    count: c.count,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">💳 השוואת כרטיסים</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₪${v}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="total" fill="#3b82f6" name="סה״כ" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
