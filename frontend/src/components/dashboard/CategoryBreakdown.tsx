import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, type Transaction } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useSort, sortTransactions } from "../../hooks/useSort";
import { formatCurrency, formatDate } from "../../lib/utils";
import { CategoryEditor } from "../transactions/CategoryEditor";
import { SortableHeader } from "../shared/SortableHeader";

interface Props {
  startDate?: string;
  endDate?: string;
}

export function CategoryBreakdown({ startDate, endDate }: Props) {
  const [selectedCat, setSelectedCat] = useState<{ id: string | null; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, error, silentRefetch: refreshChart } = useApi(
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
    categoryId: c.categoryId,
    name: c.categoryName,
    icon: c.icon || "",
    value: Math.round(c.total),
    color: c.color || "#94a3b8",
    percentage: c.percentage,
  }));

  function handleCategoryClick(categoryId: string | null, categoryName: string) {
    if (selectedCat?.id === categoryId) {
      setSelectedCat(null);
    } else {
      setSelectedCat({ id: categoryId, name: categoryName });
    }
  }

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
                cursor="pointer"
                onClick={(_: unknown, index: number) => {
                  const c = chartData?.[index];
                  if (c) handleCategoryClick(c.categoryId, c.name);
                }}
              >
                {chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={selectedCat?.id === entry.categoryId ? "#1f2937" : undefined}
                    strokeWidth={selectedCat?.id === entry.categoryId ? 3 : 1}
                  />
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
              <button
                key={c.name}
                onClick={() => handleCategoryClick(c.categoryId, c.name)}
                className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-sm transition-colors hover:bg-gray-100 ${
                  selectedCat?.id === c.categoryId ? "bg-gray-100 ring-1 ring-gray-300" : ""
                }`}
              >
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="flex-shrink-0">{c.icon}</span>
                <span className="flex-1 truncate text-right">{c.name}</span>
                <span className="flex-shrink-0 text-gray-500">
                  {c.percentage.toFixed(0)}%
                </span>
                <span className="flex-shrink-0 font-medium">
                  {formatCurrency(c.value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-down: show transactions for selected category */}
      {selectedCat && (
        <CategoryTransactions
          categoryId={selectedCat.id}
          categoryName={selectedCat.name}
          startDate={startDate}
          endDate={endDate}
          refreshKey={refreshKey}
          onClose={() => setSelectedCat(null)}
          onCategoryChanged={() => {
            refreshChart();
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

function CategoryTransactions({
  categoryId,
  categoryName,
  startDate,
  endDate,
  refreshKey,
  onClose,
  onCategoryChanged,
}: {
  categoryId: string | null;
  categoryName: string;
  startDate?: string;
  endDate?: string;
  refreshKey: number;
  onClose: () => void;
  onCategoryChanged: () => void;
}) {
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const { sortField, sortDir, toggleSort } = useSort("date", "desc");

  const { data: categories } = useApi(() => api.getCategories(), []);
  const { data, setData, isLoading, silentRefetch } = useApi(
    () =>
      api.getTransactions({
        ...(categoryId ? { categoryId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        limit: "100",
      }),
    [categoryId, startDate, endDate, refreshKey]
  );

  const sortedTransactions = useMemo(
    () => (data?.transactions ? sortTransactions(data.transactions, sortField, sortDir) : []),
    [data?.transactions, sortField, sortDir]
  );

  async function handleCategoryChange(txnId: string, newCategoryId: string) {
    const txn = data?.transactions.find((t) => t.id === txnId);
    const newCat = categories?.find((c) => c.id === newCategoryId) ?? null;

    // Optimistic update: update all transactions from the same merchant locally
    if (data && txn) {
      const updatedTxns = data.transactions.map((t) =>
        t.merchant === txn.merchant
          ? { ...t, categoryId: newCategoryId, category: newCat, categorySource: "manual" as const }
          : t
      );
      setData({ ...data, transactions: updatedTxns });
    }

    setEditingTxnId(null);
    await api.updateCategory(txnId, newCategoryId);
    silentRefetch();
    onCategoryChanged();
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-medium">
          עסקאות בקטגוריה: {categoryName} ({data?.pagination.total ?? "..."})
        </h4>
        <button
          onClick={onClose}
          className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-200"
        >
          ✕ סגור
        </button>
      </div>
      {isLoading ? (
        <div className="py-4 text-center text-gray-400">טוען...</div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <SortableHeader label="תאריך" field="date" currentField={sortField} currentDir={sortDir} onSort={toggleSort} className="px-3 py-2" />
                <SortableHeader label="תיאור" field="description" currentField={sortField} currentDir={sortDir} onSort={toggleSort} className="px-3 py-2" />
                <SortableHeader label="סכום" field="amount" currentField={sortField} currentDir={sortDir} onSort={toggleSort} className="px-3 py-2" />
                <SortableHeader label="קטגוריה" field="category" currentField={sortField} currentDir={sortDir} onSort={toggleSort} className="px-3 py-2" />
                <SortableHeader label="כרטיס" field="card" currentField={sortField} currentDir={sortDir} onSort={toggleSort} className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(txn.date)}</td>
                  <td className="px-3 py-2">{txn.description}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-medium ${txn.chargedAmount > 0 ? "text-green-600" : ""}`}>
                    {txn.chargedAmount > 0 ? "+" : ""}
                    {formatCurrency(Math.abs(txn.chargedAmount))}
                    {txn.chargedAmount > 0 && (
                      <span className="mr-1 rounded bg-green-100 px-1 text-xs text-green-700">זיכוי</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingTxnId === txn.id ? (
                      <CategoryEditor
                        categories={categories || []}
                        currentCategoryId={txn.categoryId}
                        onSelect={(catId) => handleCategoryChange(txn.id, catId)}
                        onCancel={() => setEditingTxnId(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingTxnId(txn.id)}
                        className="rounded px-2 py-1 text-xs hover:bg-gray-100"
                        title="לחץ לשינוי קטגוריה"
                      >
                        {txn.category ? (
                          <span>{txn.category.icon} {txn.category.name}</span>
                        ) : (
                          <span className="text-gray-400">לא מסווג</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    ****{txn.card.lastFourDigits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
