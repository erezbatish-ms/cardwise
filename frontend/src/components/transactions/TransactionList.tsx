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
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">עסקאות</h2>
          <p className="text-sm text-gray-400">ניהול וסיווג עסקאות</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCat(!showNewCat)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-card transition-all hover:shadow-card-hover"
          >
            ➕ קטגוריה חדשה
          </button>
          <button
            onClick={handleAutoCategorize}
            className="rounded-lg bg-gradient-to-l from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-card transition-all hover:shadow-card-hover"
          >
            🤖 סווג אוטומטית
          </button>
        </div>
      </div>

      {/* New Category Form */}
      {showNewCat && (
        <div className="mb-4 flex animate-slide-up items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">שם קטגוריה</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors focus:border-blue-300"
              placeholder="למשל: חיות מחמד"
              aria-label="שם קטגוריה חדשה"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">אייקון</label>
            <input
              type="text"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              className="w-16 rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors focus:border-blue-300"
              placeholder="🐾"
              aria-label="אייקון קטגוריה"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">צבע</label>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded-lg border border-gray-200"
              aria-label="צבע קטגוריה"
            />
          </div>
          <button
            onClick={handleCreateCategory}
            disabled={!newCatName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            צור
          </button>
          <button
            onClick={() => setShowNewCat(false)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
          >
            ביטול
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-card transition-shadow hover:shadow-card-hover focus:border-blue-300"
          aria-label="סנן לפי חודש"
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={cardId}
          onChange={(e) => { setCardId(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-card transition-shadow hover:shadow-card-hover focus:border-blue-300"
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
          placeholder="🔍 חפש עסקה..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-card transition-shadow placeholder:text-gray-300 hover:shadow-card-hover focus:border-blue-300"
          aria-label="חיפוש עסקאות"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2 py-8">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <SortableHeader label="תאריך" field="date" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="תיאור" field="description" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="סכום" field="amount" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="קטגוריה" field="category" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="כרטיס" field="card" currentField={sortField} currentDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedTransactions.map((txn, i) => (
                  <tr key={txn.id} className={`transition-colors hover:bg-blue-50/30 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{txn.description}</td>
                    <td className={`px-4 py-3 whitespace-nowrap font-semibold ${txn.chargedAmount > 0 ? "text-emerald-600" : "text-gray-800"}`}>
                      {txn.chargedAmount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(txn.chargedAmount))}
                      {txn.chargedAmount > 0 && (
                        <span className="mr-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">זיכוי</span>
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
                          className="rounded-lg px-2.5 py-1 text-xs transition-colors hover:bg-gray-100"
                          title="לחץ לשינוי קטגוריה"
                        >
                          {txn.category ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700">
                              {txn.category.icon} {txn.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">לא מסווג</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      ****{txn.card.lastFourDigits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-card transition-all hover:shadow-card-hover disabled:opacity-40"
              >
                ← הקודם
              </button>
              <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                {page} / {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page >= data.pagination.pages}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-card transition-all hover:shadow-card-hover disabled:opacity-40"
              >
                הבא →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
