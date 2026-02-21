import { api, type Insight } from "../../lib/api";
import { useApi } from "../../hooks/useApi";

export function AiInsights({ period }: { period?: string }) {
  const { data, isLoading, error, refetch } = useApi(
    () => api.getInsights(undefined, period),
    [period]
  );

  async function handleRefresh() {
    await api.refreshInsights(undefined, period);
    refetch();
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🤖 תובנות AI</h3>
        <div className="py-8 text-center text-gray-400">מנתח נתונים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">🤖 תובנות AI</h3>
        <div className="py-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">🤖 תובנות וטיפים</h3>
        <button
          onClick={handleRefresh}
          className="rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
        >
          🔄 רענן
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const severityStyles = {
    info: "border-blue-200 bg-blue-50",
    warning: "border-amber-200 bg-amber-50",
    tip: "border-green-200 bg-green-50",
  };

  const severityIcons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${severityStyles[insight.severity]}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span>{severityIcons[insight.severity]}</span>
        <h4 className="font-medium">{insight.title}</h4>
      </div>
      <p className="text-sm text-gray-700">{insight.content}</p>
    </div>
  );
}
