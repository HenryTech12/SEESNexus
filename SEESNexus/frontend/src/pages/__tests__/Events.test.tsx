import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Events from "../Events";
import api from "../../api/axios";
import toast from "react-hot-toast";
import type { Event } from "../../types";
import { EventType } from "../../types";

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// Relative to whenever the test actually runs, not a fixed date — a
// hardcoded absolute date eventually falls into the past and makes
// Events.tsx correctly (but confusingly) treat the event as over.
const now = Date.now();
const HOUR = 60 * 60 * 1000;

const mockEvent: Event = {
  id: "evt-1",
  title: "Neural Network Workshop",
  description: "Deep dive into building and training neural networks.",
  event_type: EventType.WORKSHOP,
  location: "Systems Lab 1",
  is_virtual: false,
  start_date: new Date(now + 24 * HOUR).toISOString(),
  end_date: new Date(now + 26 * HOUR).toISOString(),
  registration_deadline: new Date(now + 12 * HOUR).toISOString(),
  max_participants: 50,
  created_by_id: "admin-1",
  created_at: new Date(now - 30 * 24 * HOUR).toISOString(),
  updated_at: new Date(now - 30 * 24 * HOUR).toISOString(),
};

const renderEvents = () =>
  render(
    <MemoryRouter>
      <Events />
    </MemoryRouter>,
  );

describe("Events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { events: [mockEvent] } },
    });
  });

  it("registers for an event and disables the button afterward", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { data: { status: "CONFIRMED" } },
    });

    renderEvents();

    await screen.findByText(/neural network workshop/i);
    await user.click(screen.getByRole("button", { name: /request access/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/events/evt-1/register"),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Access granted. You're registered.",
    );
    expect(
      await screen.findByRole("button", { name: /registered/i }),
    ).toBeDisabled();
  });

  it("shows a waitlist toast instead of a registered toast when the event is full", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { data: { status: "WAITLISTED" } },
    });

    renderEvents();

    await screen.findByText(/neural network workshop/i);
    await user.click(screen.getByRole("button", { name: /request access/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Event is full — you've been added to the waitlist.",
      ),
    );
    expect(
      await screen.findByRole("button", { name: /waitlisted/i }),
    ).toBeDisabled();
  });

  it("shows an error toast and keeps the button enabled when registration fails", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { detail: "Event is full" } },
    });

    renderEvents();

    await screen.findByText(/neural network workshop/i);
    await user.click(screen.getByRole("button", { name: /request access/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Event is full"),
    );
    expect(
      screen.getByRole("button", { name: /request access/i }),
    ).toBeEnabled();
  });
});
