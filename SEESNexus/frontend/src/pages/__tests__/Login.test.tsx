import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";
import api from "../../api/axios";
import toast from "react-hot-toast";

// Canvas renders null so its three-fiber/drei children never mount under jsdom.
vi.mock("@react-three/fiber", () => ({
  Canvas: () => null,
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../api/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("logs in successfully, persists tokens, and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        data: {
          access_token: "access-123",
          refresh_token: "refresh-123",
          user: { id: "u1", full_name: "Jane Doe", role: "STUDENT" },
        },
      },
    });

    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/name@students/i),
      "jane@students.unilag.edu.ng",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(
      screen.getByRole("button", { name: /initialize login/i }),
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/dashboard"),
    );

    expect(api.post).toHaveBeenCalledWith(
      "/auth/login",
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
    );
    expect(localStorage.getItem("sees_access_token")).toBe("access-123");
    expect(localStorage.getItem("sees_refresh_token")).toBe("refresh-123");
    expect(toast.success).toHaveBeenCalledWith("Login successful!");
  });

  it("shows an error toast and does not navigate when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { detail: "Invalid credentials" } },
    });

    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/name@students/i),
      "jane@students.unilag.edu.ng",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(
      screen.getByRole("button", { name: /initialize login/i }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials"),
    );
    expect(navigateMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("sees_access_token")).toBeNull();
  });
});
