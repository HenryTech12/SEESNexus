import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "../Profile";
import hardwareService from "../../services/hardwareService";
import authService from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { UserRole, type HardwareLoan, type Hardware } from "../../types";
import toast from "react-hot-toast";

vi.mock("../../services/hardwareService", () => ({
  default: { getMyLoans: vi.fn(), returnLoan: vi.fn() },
}));

vi.mock("../../services/authService", () => ({
  default: { updateMe: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const approvedLoan: HardwareLoan = {
  id: "loan-1",
  hardware_id: "hw-1",
  borrower_id: "user-1",
  status: "APPROVED",
  purpose: "Final year project",
  request_date: "2026-06-01T00:00:00.000Z",
  expected_return_date: "2026-07-01T00:00:00.000Z",
  hardware: { id: "hw-1", name: "Arduino Uno R3" } as unknown as Hardware,
};

const pendingLoan: HardwareLoan = {
  id: "loan-2",
  hardware_id: "hw-2",
  borrower_id: "user-1",
  status: "PENDING",
  purpose: "Lab demo",
  request_date: "2026-06-05T00:00:00.000Z",
  expected_return_date: "2026-07-05T00:00:00.000Z",
  hardware: { id: "hw-2", name: "Multimeter" } as unknown as Hardware,
};

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "jane@students.unilag.edu.ng",
        full_name: "Jane Doe",
        role: UserRole.STUDENT,
        is_active: true,
        bio: "Hardware tinkerer.",
        department: "Computer Engineering",
        level: "300L",
      },
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  describe("hardware return flow", () => {
    it("shows Mark Returned only for APPROVED loans, not PENDING ones", async () => {
      vi.mocked(hardwareService.getMyLoans).mockResolvedValue([
        approvedLoan,
        pendingLoan,
      ]);

      renderProfile();

      await screen.findByText("Arduino Uno R3");
      const returnButtons = screen.getAllByRole("button", {
        name: /mark returned/i,
      });
      expect(returnButtons).toHaveLength(1);
    });

    it("marks a loan as returned after confirming, without a refetch", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      vi.mocked(hardwareService.getMyLoans).mockResolvedValue([approvedLoan]);
      vi.mocked(hardwareService.returnLoan).mockResolvedValueOnce({} as never);

      const user = userEvent.setup();
      renderProfile();

      await user.click(
        await screen.findByRole("button", { name: /mark returned/i }),
      );

      await waitFor(() =>
        expect(hardwareService.returnLoan).toHaveBeenCalledWith("loan-1"),
      );
      expect(toast.success).toHaveBeenCalledWith("Marked as returned");
      expect(screen.getByText("RETURNED")).toBeInTheDocument();
      expect(hardwareService.getMyLoans).toHaveBeenCalledTimes(1);
    });

    it("does not call returnLoan when the confirmation is dismissed", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      vi.mocked(hardwareService.getMyLoans).mockResolvedValue([approvedLoan]);

      const user = userEvent.setup();
      renderProfile();

      await user.click(
        await screen.findByRole("button", { name: /mark returned/i }),
      );

      expect(hardwareService.returnLoan).not.toHaveBeenCalled();
    });
  });

  describe("profile editing", () => {
    it("saves bio/department/level edits via authService.updateMe", async () => {
      vi.mocked(hardwareService.getMyLoans).mockResolvedValue([]);
      vi.mocked(authService.updateMe).mockResolvedValueOnce({
        bio: "New bio",
        department: "Systems Engineering",
        level: "400L",
      } as never);

      const user = userEvent.setup();
      renderProfile();

      await user.click(await screen.findByRole("button", { name: /edit/i }));

      const bioField = screen.getByPlaceholderText(/tell us about yourself/i);
      await user.clear(bioField);
      await user.type(bioField, "New bio");

      await user.selectOptions(screen.getByDisplayValue("Computer Engineering"), "Systems Engineering");
      await user.selectOptions(screen.getByDisplayValue("300L"), "400L");

      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() =>
        expect(authService.updateMe).toHaveBeenCalledWith({
          bio: "New bio",
          department: "Systems Engineering",
          level: "400L",
        }),
      );
      expect(toast.success).toHaveBeenCalledWith("Profile updated");
    });
  });
});
