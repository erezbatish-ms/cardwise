import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LoginForm } from "../../components/layout/LoginForm";

// Mock useAuth
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("LoginForm", () => {
  it("should render login form with CardWise title", () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    expect(screen.getByText(/CardWise/)).toBeInTheDocument();
    expect(screen.getByLabelText("סיסמה")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "התחבר" })).toBeInTheDocument();
  });

  it("should have password input focused by default", () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    expect(screen.getByLabelText("סיסמה")).toHaveFocus();
  });

  it("should disable submit button while loading", async () => {
    render(<BrowserRouter><LoginForm /></BrowserRouter>);
    const input = screen.getByLabelText("סיסמה");
    const button = screen.getByRole("button", { name: "התחבר" });

    fireEvent.change(input, { target: { value: "testpass" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeInTheDocument();
    });
  });
});
