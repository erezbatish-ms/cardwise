import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiInsights } from "../../components/dashboard/AiInsights";

vi.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    data: [
      { type: "tip", title: "חסכו במזון", content: "נסו לבשל בבית", severity: "tip" },
      { type: "warning", title: "עלייה בהוצאות", content: "סך ההוצאות עלה", severity: "warning" },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../lib/api", () => ({
  api: {
    getInsights: vi.fn(),
    refreshInsights: vi.fn(),
  },
}));

describe("AiInsights", () => {
  it("should render insights section title", () => {
    render(<AiInsights />);
    expect(screen.getByText(/תובנות וטיפים/)).toBeInTheDocument();
  });

  it("should display insight cards", () => {
    render(<AiInsights />);
    expect(screen.getByText("חסכו במזון")).toBeInTheDocument();
    expect(screen.getByText("עלייה בהוצאות")).toBeInTheDocument();
  });

  it("should show insight content", () => {
    render(<AiInsights />);
    expect(screen.getByText("נסו לבשל בבית")).toBeInTheDocument();
  });

  it("should have refresh button", () => {
    render(<AiInsights />);
    expect(screen.getByRole("button", { name: /רענן/ })).toBeInTheDocument();
  });

  it("should display severity icons", () => {
    render(<AiInsights />);
    expect(screen.getByText("💡")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });
});
