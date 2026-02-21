import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../lib/utils";

interface Props {
  startDate?: string;
  endDate?: string;
}

export function CategoryBreakdown({ startDate, endDate }: Props) {
  const { data, isLoading, error } = useApi(
    () => api.getCategoryBreakdown(undefined, startDate, endDate),
    [startDate, endDate]
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🥧 פילוח לפי קטגוריות</h3>
        <div className="flex h-[300px] items-center justify-center text-gray-400">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🥧 פילוח לפי קטגוריות</h3>
        <div className="flex h-[300px] items-center justify-center text-red-500">{error}</div>
      </div>
    );
  }

  const chartData = data?.map((c) => ({
    name: c.categoryName,
    icon: c.icon || "",
    value: Math.round(c.total),
    color: c.color || "#94a3b8",
    percentage: c.percentage,
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">🥧 פילוח לפי קטגוריות</h3>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
              >
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="max-h-[250px] w-full overflow-y-auto lg:w-1/2">
          <div className="space-y-1.5">
            {chartData?.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="flex-shrink-0">{c.icon}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="flex-shrink-0 text-gray-500">
                  {c.percentage.toFixed(0)}%
                </span>
                <span className="flex-shrink-0 font-medium">
                  {formatCurrency(c.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
