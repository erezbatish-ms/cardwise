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
      className={`cursor-pointer select-none px-4 py-3 text-right font-medium text-gray-600 hover:text-gray-900 ${className}`}
      onClick={() => onSort(field)}
      aria-sort={isActive ? (currentDir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-xs ${isActive ? "text-blue-600" : "text-gray-300"}`}>
          {isActive ? (currentDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </span>
    </th>
  );
}
