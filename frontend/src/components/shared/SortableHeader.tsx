import type { SortField, SortDir } from "../../hooks/useSort";

interface Props {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}

export function SortableHeader({ label, field, currentField, currentDir, onSort, className = "" }: Props) {
  const isActive = currentField === field;
  return (
    <th
      className={`cursor-pointer select-none px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-800 ${className}`}
      onClick={() => onSort(field)}
      aria-sort={isActive ? (currentDir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${isActive ? "text-blue-600" : "text-gray-300"}`}>
          {isActive ? (currentDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </span>
    </th>
  );
}
