import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../lib/utils";

interface Props {
  startDate?: string;
  endDate?: string;
}

export function TopMerchants({ startDate, endDate }: Props) {
  const { data, isLoading, error } = useApi(
    () => api.getTopMerchants(undefined, 10, startDate, endDate),
    [startDate, endDate]
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🏪 בתי עסק מובילים</h3>
        <div className="py-8 text-center text-gray-400">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🏪 בתי עסק מובילים</h3>
        <div className="py-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  const maxTotal = data?.[0]?.total || 1;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">🏪 בתי עסק מובילים</h3>
      <div className="space-y-3">
        {data?.map((m, i) => (
          <div key={m.merchant} className="flex items-center gap-3">
            <span className="w-6 text-center text-sm text-gray-400">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{m.merchant}</span>
                <span className="text-gray-600">
                  {formatCurrency(m.total)} ({m.count} עסקאות)
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${(m.total / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
