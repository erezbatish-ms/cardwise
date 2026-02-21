import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryEditor } from "../../components/transactions/CategoryEditor";

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "מזון ומסעדות", icon: "🍽️", color: "#ef4444", isDefault: true },
  { id: "cat-2", name: "סופרמרקט", icon: "🛒", color: "#f97316", isDefault: true },
];

describe("CategoryEditor", () => {
  it("should render category select dropdown", () => {
    render(
      <CategoryEditor
        categories={MOCK_CATEGORIES}
        currentCategoryId={null}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByLabelText("בחר קטגוריה")).toBeInTheDocument();
  });

  it("should list all categories as options", () => {
    render(
      <CategoryEditor
        categories={MOCK_CATEGORIES}
        currentCategoryId={null}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/מזון ומסעדות/)).toBeInTheDocument();
    expect(screen.getByText(/סופרמרקט/)).toBeInTheDocument();
  });

  it("should have cancel button", () => {
    render(
      <CategoryEditor
        categories={MOCK_CATEGORIES}
        currentCategoryId={null}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("ביטול")).toBeInTheDocument();
  });

  it("should call onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <CategoryEditor
        categories={MOCK_CATEGORIES}
        currentCategoryId={null}
        onSelect={vi.fn()}
        onCancel={onCancel}
      />
    );
    screen.getByText("ביטול").click();
    expect(onCancel).toHaveBeenCalled();
  });
});
