import { useMemo, useState } from "react";
import type { Transaction } from "../lib/api";

export type SortField = "date" | "description" | "amount" | "category" | "card";
export type SortDir = "asc" | "desc";

export function useSort(defaultField: SortField = "date", defaultDir: SortDir = "desc") {
  const [sortField, setSortField] = useState<SortField>(defaultField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" || field === "amount" ? "desc" : "asc");
    }
  }

  return { sortField, sortDir, toggleSort };
}

export function sortTransactions(
  txns: Transaction[],
  field: SortField,
  dir: SortDir
): Transaction[] {
  const sorted = [...txns].sort((a, b) => {
    switch (field) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "description":
        return (a.description || "").localeCompare(b.description || "", "he");
      case "amount":
        return Math.abs(a.chargedAmount) - Math.abs(b.chargedAmount);
      case "category":
        return (a.category?.name || "תתת").localeCompare(b.category?.name || "תתת", "he");
      case "card":
        return (a.card.lastFourDigits || "").localeCompare(b.card.lastFourDigits || "");
      default:
        return 0;
    }
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}
