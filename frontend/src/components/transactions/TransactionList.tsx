import { useState } from "react";
import { api, type Transaction } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { formatCurrency, formatDate } from "../../lib/utils";
import { CategoryEditor } from "./CategoryEditor";

export function TransactionList() {
  const [cardId, setCardId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: cards } = useApi(() => api.getCards(), []);
  const { data: categories } = useApi(() => api.getCategories(), []);
  const { data, isLoading, refetch } = useApi(
    () =>
      api.getTransactions({
        ...(cardId ? { cardId } : {}),
        ...(search ? { search } : {}),
        page: String(page),
        limit: "50",
      }),
    [cardId, search, page]
  );

  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  async function handleCategoryChange(txnId: string, categoryId: string) {
    await api.updateCategory(txnId, categoryId);
    setEditingTxn(null);
    refetch();
  }

  async function handleAutoCategorize() {
    await api.triggerCategorize();
    refetch();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">עסקאות</h2>
        <button
          onClick={handleAutoCategorize}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
        >
          🤖 סווג אוטומטית
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={cardId}
          onChange={(e) => { setCardId(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-label="סנן לפי כרטיס"
        >
          <option value="">כל הכרטיסים</option>
          {cards?.map((card) => (
            <option key={card.id} value={card.id}>
              {card.cardName || `****${card.lastFourDigits}`}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="חפש עסקה..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-label="חיפוש עסקאות"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">טוען עסקאות...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">תאריך</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">תיאור</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">סכום</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">קטגוריה</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">כרטיס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3">{txn.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {formatCurrency(Math.abs(txn.chargedAmount))}
                    </td>
                    <td className="px-4 py-3">
                      {editingTxn?.id === txn.id ? (
                        <CategoryEditor
                          categories={categories || []}
                          currentCategoryId={txn.categoryId}
                          onSelect={(catId) => handleCategoryChange(txn.id, catId)}
                          onCancel={() => setEditingTxn(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingTxn(txn)}
                          className="rounded px-2 py-1 text-xs hover:bg-gray-100"
                          title="לחץ לשינוי קטגוריה"
                        >
                          {txn.category ? (
                            <span>
                              {txn.category.icon} {txn.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">לא מסווג</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      ****{txn.card.lastFourDigits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                הקודם
              </button>
              <span className="text-sm text-gray-600">
                עמוד {page} מתוך {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page >= data.pagination.pages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                הבא
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
