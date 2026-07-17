import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminPanel from "../AdminPanel";
import adminService from "../../services/adminService";
import hardwareService from "../../services/hardwareService";
import projectService from "../../services/projectService";
import eventService from "../../services/eventService";
import toast from "react-hot-toast";
import type { HardwareLoan, Hardware, User } from "../../types";

vi.mock("../../services/adminService", () => ({
  default: {
    getAllLoans: vi.fn(),
    getUsers: vi.fn(),
    updateUserRole: vi.fn(),
    deactivateUser: vi.fn(),
    approveLoan: vi.fn(),
    rejectLoan: vi.fn(),
    getDashboardStats: vi.fn(),
  },
}));

vi.mock("../../services/hardwareService", () => ({
  default: { getAll: vi.fn(), remove: vi.fn() },
}));

vi.mock("../../services/projectService", () => ({
  default: { getAll: vi.fn(), updateStatus: vi.fn(), remove: vi.fn() },
}));

vi.mock("../../services/eventService", () => ({
  default: { getAll: vi.fn(), remove: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const pendingLoan: HardwareLoan = {
  id: "loan-1",
  hardware_id: "hw-1",
  borrower_id: "user-1",
  status: "PENDING",
  purpose: "Final year project",
  request_date: "2026-06-01T00:00:00.000Z",
  expected_return_date: "2026-07-01T00:00:00.000Z",
  hardware: { id: "hw-1", name: "Arduino Uno R3" } as unknown as Hardware,
  borrower: { id: "user-1", full_name: "Jane Doe" } as unknown as User,
};

const renderAdminPanel = () =>
  render(
    <MemoryRouter>
      <AdminPanel />
    </MemoryRouter>,
  );

describe("AdminPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.getAllLoans).mockResolvedValue([pendingLoan]);
    vi.mocked(adminService.getUsers).mockResolvedValue([]);
    vi.mocked(projectService.getAll).mockResolvedValue([]);
    vi.mocked(eventService.getAll).mockResolvedValue([]);
    vi.mocked(hardwareService.getAll).mockResolvedValue([]);
    vi.mocked(adminService.getDashboardStats).mockResolvedValue({
      total_users: 0,
      total_projects: 0,
      active_loans: 0,
      pending_loans: 1,
      upcoming_events: 0,
      total_articles: 0,
    });
  });

  it("disables EXPORT_LOGS and EMERGENCY_HALT — no backend endpoint exists for either", async () => {
    renderAdminPanel();
    await screen.findByText("ADMIN COMMAND CENTER");

    expect(
      screen.getByRole("button", { name: /export_logs/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /emergency_halt/i }),
    ).toBeDisabled();
  });

  it("prompts for a reason and sends it when rejecting a loan", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("Item needed for another booking");
    vi.mocked(adminService.rejectLoan).mockResolvedValueOnce({} as never);

    const user = userEvent.setup();
    renderAdminPanel();

    await user.click(
      screen.getByRole("button", { name: /hardware loans/i }),
    );
    await user.click(await screen.findByTitle("Reject"));

    await waitFor(() =>
      expect(adminService.rejectLoan).toHaveBeenCalledWith(
        "loan-1",
        "Item needed for another booking",
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Loan rejected");
  });

  it("aborts the rejection when the reason prompt is cancelled", async () => {
    vi.spyOn(window, "prompt").mockReturnValue(null);

    const user = userEvent.setup();
    renderAdminPanel();

    await user.click(
      screen.getByRole("button", { name: /hardware loans/i }),
    );
    await user.click(await screen.findByTitle("Reject"));

    expect(adminService.rejectLoan).not.toHaveBeenCalled();
  });
});
