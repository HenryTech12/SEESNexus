import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HardwareInspectorPanel from "../HardwareInspectorPanel";
import hardwareService from "../../../services/hardwareService";
import toast from "react-hot-toast";
import {
  HardwareCategory,
  HardwareStatus,
  type Hardware,
} from "../../../types";

vi.mock("../../../services/hardwareService", () => ({
  default: { getById: vi.fn(), requestLoan: vi.fn(), getMyLoans: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockItem: Hardware = {
  id: "hw-1",
  name: "Arduino Uno R3",
  description: "Microcontroller board",
  category: HardwareCategory.MICROCONTROLLER,
  status: HardwareStatus.AVAILABLE,
  quantity: 10,
  available_quantity: 5,
};

describe("HardwareInspectorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hardwareService.getById).mockResolvedValue({
      loan_history_count: 3,
    } as never);
    vi.mocked(hardwareService.getMyLoans).mockResolvedValue([]);
  });

  it("submits a loan request with the entered purpose and return date", async () => {
    const user = userEvent.setup();
    const onLoanSuccess = vi.fn();
    vi.mocked(hardwareService.requestLoan).mockResolvedValueOnce({} as never);

    const { container } = render(
      <HardwareInspectorPanel
        item={mockItem}
        onClose={vi.fn()}
        onLoanSuccess={onLoanSuccess}
      />,
    );

    await user.type(
      screen.getByPlaceholderText(/describe what you need this for/i),
      "Final year project demo",
    );

    const dateInput = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-07-01" } });

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() =>
      expect(hardwareService.requestLoan).toHaveBeenCalledWith("hw-1", {
        purpose: "Final year project demo",
        expected_return_date: new Date("2026-07-01").toISOString(),
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Loan request submitted!");
    expect(onLoanSuccess).toHaveBeenCalled();
  });

  it("shows an error toast and does not call onLoanSuccess when the request fails", async () => {
    const user = userEvent.setup();
    const onLoanSuccess = vi.fn();
    vi.mocked(hardwareService.requestLoan).mockRejectedValueOnce({
      response: { data: { detail: "No units left" } },
    });

    const { container } = render(
      <HardwareInspectorPanel
        item={mockItem}
        onClose={vi.fn()}
        onLoanSuccess={onLoanSuccess}
      />,
    );

    await user.type(
      screen.getByPlaceholderText(/describe what you need this for/i),
      "Final year project demo",
    );
    const dateInput = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-07-01" } });

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("No units left"),
    );
    expect(onLoanSuccess).not.toHaveBeenCalled();
  });

  it("disables the submit button and labels it NOT AVAILABLE when no units remain", () => {
    render(
      <HardwareInspectorPanel
        item={{ ...mockItem, available_quantity: 0 }}
        onClose={vi.fn()}
        onLoanSuccess={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /not available/i }),
    ).toBeDisabled();
  });

  it("shows YOUR LOAN STATUS and hides the request form when the user already has a pending loan on this item", async () => {
    vi.mocked(hardwareService.getMyLoans).mockResolvedValue([
      {
        id: "loan-1",
        hardware_id: "hw-1",
        borrower_id: "user-1",
        status: "PENDING",
        purpose: "Final year project demo",
        request_date: "2026-06-01T00:00:00.000Z",
        expected_return_date: "2026-07-01T00:00:00.000Z",
      },
    ]);

    render(
      <HardwareInspectorPanel
        item={mockItem}
        onClose={vi.fn()}
        onLoanSuccess={vi.fn()}
      />,
    );

    expect(await screen.findByText(/your loan status/i)).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit request/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show YOUR LOAN STATUS when the user has no active loan on this item", async () => {
    render(
      <HardwareInspectorPanel
        item={mockItem}
        onClose={vi.fn()}
        onLoanSuccess={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(hardwareService.getMyLoans).toHaveBeenCalled(),
    );
    expect(screen.queryByText(/your loan status/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeInTheDocument();
  });
});
