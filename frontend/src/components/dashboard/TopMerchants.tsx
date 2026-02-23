import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../lib/utils";
import { Card, CardSkeleton } from "../shared/Card";

interface Props {
  startDate?: string;
  endDate?: string;
}

export function TopMerchants({ startDate, endDate }: Props) {
  const { data, isLoading, error } = useApi(
    () => api.getTopMerchants(undefined, 10, startDate, endDate),
    [startDate, endDate]
  );

  if (isLoading) return <CardSkeleton title="🏪 בתי עסק מובילים" height={250} />;

  if (error) {
    return (
      <Card title="🏪 בתי עסק מובילים">
        <div className="py-8 text-center text-red-500">{error}</div>
      </Card>
    );
  }

  const maxTotal = data?.[0]?.total || 1;

  return (
    <Card title="🏪 בתי עסק מובילים">
      <div className="space-y-3">
        {data?.map((m, i) => (
          <div key={m.merchant} className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">{m.merchant}</span>
                <span className="text-gray-500">
                  {formatCurrency(m.total)} ({m.count} עסקאות)
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-l from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${(m.total / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
