import { useState, useMemo } from "react";
import { api, type Transaction, type Category } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useSort, sortTransactions } from "../../hooks/useSort";
import { formatCurrency, formatDate } from "../../lib/utils";
import { CategoryEditor } from "./CategoryEditor";
import { SortableHeader } from "../shared/SortableHeader";

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [{ value: "", label: "כל החודשים" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("he-IL", { year: "numeric", month: "long" }).format(d);
    options.push({ value, label });
  }
  return options;
}

export function TransactionList() {
  const [cardId, setCardId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [page, setPage] = useState(1);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");

  // Compute date range from selected month
  let startDate: string | undefined;
  let endDate: string | undefined;
  if (selectedMonth) {
    const [y, m] = selectedMonth.split("-").map(Number);
    startDate = new Date(y, m - 1, 1).toISOString();
    endDate = new Date(y, m, 0, 23, 59, 59).toISOString();
  }

  const { data: cards } = useApi(() => api.getCards(), []);
  const { data: categories, refetch: refetchCats } = useApi(() => api.getCategories(), []);
  const { data, setData, isLoading, refetch, silentRefetch } = useApi(
    () =>
      api.getTransactions({
        ...(cardId ? { cardId } : {}),
        ...(search ? { search } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        page: String(page),
        limit: "50",
      }),
    [cardId, search, selectedMonth, page]
  );

  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const { sortField, sortDir, toggleSort } = useSort("date", "desc");

  const sortedTransactions = useMemo(
    () => (data?.transactions ? sortTransactions(data.transactions, sortField, sortDir) : []),
    [data?.transactions, sortField, sortDir]
  );

  async function handleCategoryChange(txnId: string, categoryId: string) {
    const txn = data?.transactions.find((t) => t.id === txnId);
    const newCat = categories?.find((c) => c.id === categoryId) ?? null;

    // Optimistic update: update all transactions from the same merchant locally
    if (data && txn) {
      const updatedTxns = data.transactions.map((t) =>
        t.merchant === txn.merchant
          ? { ...t, categoryId, category: newCat, categorySource: "manual" as const }
          : t
      );
      setData({ ...data, transactions: updatedTxns });
    }

    setEditingTxn(null);
    await api.updateCategory(txnId, categoryId);
    silentRefetch();
  }

  async function handleAutoCategorize() {
    await api.triggerCategorize();
    refetch();
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    await api.createCategory(newCatName.trim(), newCatIcon || undefined, newCatColor);
    setNewCatName("");
    setNewCatIcon("");
    setNewCatColor("#6366f1");
    setShowNewCat(false);
    refetchCats();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">עסקאות</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCat(!showNewCat)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            ➕ קטגוריה חדשה
          </button>
          <button
            onClick={handleAutoCategorize}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
          >
            🤖 סווג אוטומטית
          </button>
        </div>
      </div>

      {/* New Category Form */}
      {showNewCat && (
        <div className="mb-4 flex items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-xs text-gray-600">שם קטגוריה</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="למשל: חיות מחמד"
              aria-label="שם קטגוריה חדשה"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">אייקון</label>
            <input
              type="text"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="w-16 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="🐾"
              aria-label="אייקון קטגוריה"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">צבע</label>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-gray-300"
              aria-label="צבע קטגוריה"
            />
          </div>
          <button
            onClick={handleCreateCategory}
            disabled={!newCatName.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            צור
          </button>
          <button
            onClick={() => setShowNewCat(false)}
            className="rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            ביטול
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-label="סנן לפי חודש"
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

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
                  <SortableHeader label="תאריך" field="date" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="תיאור" field="description" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="סכום" field="amount" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="קטגוריה" field="category" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="כרטיס" field="card" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3">{txn.description}</td>
                    <td className={`px-4 py-3 whitespace-nowrap font-medium ${txn.chargedAmount > 0 ? "text-green-600" : ""}`}>
                      {txn.chargedAmount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(txn.chargedAmount))}
                      {txn.chargedAmount > 0 && (
                        <span className="mr-1 rounded bg-green-100 px-1 text-xs text-green-700">זיכוי</span>
                      )}
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
