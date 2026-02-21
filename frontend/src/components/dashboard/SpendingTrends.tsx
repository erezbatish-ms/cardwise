import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency, formatMonth } from "../../lib/utils";

export function SpendingTrends() {
  const { data, isLoading, error } = useApi(() => api.getTrends(undefined, 12), []);

  if (isLoading) return <ChartSkeleton title="מגמות הוצאות" />;
  if (error) return <ChartError title="מגמות הוצאות" error={error} />;

  const chartData = data?.map((t) => ({
    month: formatMonth(t.month),
    total: Math.round(t.total),
    count: t.count,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">📈 מגמות הוצאות (12 חודשים)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₪${v}`} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "סה״כ"]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="flex h-[300px] items-center justify-center text-gray-400">
        טוען...
      </div>
    </div>
  );
}

function ChartError({ title, error }: { title: string; error: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="flex h-[300px] items-center justify-center text-red-500">
        {error}
      </div>
    </div>
  );
}
