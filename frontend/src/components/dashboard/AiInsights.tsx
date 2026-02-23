import { api, type Insight } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { Card, CardSkeleton } from "../shared/Card";

export function AiInsights({ period }: { period?: string }) {
  const { data, isLoading, error, refetch } = useApi(
    () => api.getInsights(undefined, period),
    [period]
  );

  async function handleRefresh() {
    await api.refreshInsights(undefined, period);
    refetch();
  }

  if (isLoading) return <CardSkeleton title="🤖 תובנות וטיפים" />;

  if (error) {
    return (
      <Card title="🤖 תובנות AI">
        <div className="py-8 text-center text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card
      title="🤖 תובנות וטיפים"
      headerAction={
        <button
          onClick={handleRefresh}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          🔄 רענן
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const styles = {
    info: "border-l-blue-500 bg-blue-50/50",
    warning: "border-l-amber-500 bg-amber-50/50",
    tip: "border-l-emerald-500 bg-emerald-50/50",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
  };

  return (
    <div
      className={`animate-fade-in rounded-xl border border-gray-100 border-l-4 p-4 transition-shadow hover:shadow-card ${styles[insight.severity]}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{icons[insight.severity]}</span>
        <h4 className="font-semibold text-gray-800">{insight.title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{insight.content}</p>
    </div>
  );
}
