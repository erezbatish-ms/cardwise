import type { Category } from "../../lib/api";

interface CategoryEditorProps {
  categories: Category[];
  currentCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  onCancel: () => void;
}

export function CategoryEditor({
  categories,
  currentCategoryId,
  onSelect,
  onCancel,
}: CategoryEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={currentCategoryId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-xs"
        autoFocus
        aria-label="בחר קטגוריה"
      >
        <option value="" disabled>
          בחר קטגוריה
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>
      <button
        onClick={onCancel}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        ביטול
      </button>
    </div>
  );
}
