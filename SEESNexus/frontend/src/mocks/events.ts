import { Event, EventType } from "../types";

// Fallback data shown when the /events API is unreachable.
// No banner_url — Pollinations.ai generates images dynamically from title + event_type.
export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Neural Network Workshop",
    event_type: EventType.WORKSHOP,
    start_date: "2026-08-24T14:00:00Z",
    end_date: "2026-08-24T17:00:00Z",
    registration_deadline: "2026-08-23T23:59:00Z",
    location: "Systems Lab 1",
    is_virtual: false,
    description:
      "Deep dive into building and training neural networks from scratch using PyTorch.",
    max_participants: 50,
    created_by_id: "admin-1",
    created_at: "2026-07-01T09:00:00Z",
    updated_at: "2026-07-01T09:00:00Z",
  },
  {
    id: "2",
    title: "NexGen Hackathon 2.0",
    event_type: EventType.HACKATHON,
    start_date: "2026-09-12T08:00:00Z",
    end_date: "2026-09-13T20:00:00Z",
    registration_deadline: "2026-09-10T23:59:00Z",
    location: "Main Engineering Hall",
    is_virtual: false,
    description:
      "The flagship SEES Hackathon. Build innovative solutions for Nigeria's energy sector.",
    max_participants: 150,
    created_by_id: "admin-1",
    created_at: "2026-07-01T09:00:00Z",
    updated_at: "2026-07-01T09:00:00Z",
  },
  {
    id: "3",
    title: "Clean Energy Seminar",
    event_type: EventType.SEMINAR,
    start_date: "2026-08-15T10:00:00Z",
    end_date: "2026-08-15T13:00:00Z",
    registration_deadline: "2026-08-14T23:59:00Z",
    location: "Virtual Zoom",
    is_virtual: true,
    virtual_link: "https://zoom.us/example",
    description:
      "Industry experts discuss the future of renewable energy integration in Africa.",
    max_participants: 100,
    created_by_id: "admin-1",
    created_at: "2026-07-01T09:00:00Z",
    updated_at: "2026-07-01T09:00:00Z",
  },
];
