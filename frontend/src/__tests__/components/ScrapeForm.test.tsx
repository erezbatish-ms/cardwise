import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrapeForm } from "../../components/scrape/ScrapeForm";

vi.mock("../../lib/api", () => ({
  api: {
    scrape: vi.fn().mockResolvedValue({ status: "success", message: "נסרקו 10 עסקאות" }),
  },
}));

describe("ScrapeForm", () => {
  it("should render scrape form with security notice", () => {
    render(<ScrapeForm />);
    expect(screen.getByText("סריקת נתוני ישראכרט")).toBeInTheDocument();
    expect(screen.getByText(/פרטי ההתחברות שלך לא נשמרים/)).toBeInTheDocument();
  });

  it("should have username and password inputs", () => {
    render(<ScrapeForm />);
    expect(screen.getByLabelText("שם משתמש ישראכרט")).toBeInTheDocument();
    expect(screen.getByLabelText("סיסמת ישראכרט")).toBeInTheDocument();
  });

  it("should have optional start date input", () => {
    render(<ScrapeForm />);
    expect(screen.getByLabelText(/תאריך התחלה/)).toBeInTheDocument();
  });

  it("should have autoComplete off on credential inputs", () => {
    render(<ScrapeForm />);
    expect(screen.getByLabelText("שם משתמש ישראכרט")).toHaveAttribute("autoComplete", "off");
    expect(screen.getByLabelText("סיסמת ישראכרט")).toHaveAttribute("autoComplete", "off");
  });

  it("should have submit button", () => {
    render(<ScrapeForm />);
    expect(screen.getByRole("button", { name: /התחל סריקה/ })).toBeInTheDocument();
  });
});
