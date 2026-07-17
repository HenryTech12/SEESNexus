import api from "../api/axios";
import { Event, EventType, EventRegistration } from "../types";

export interface EventListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  upcoming_only?: boolean;
}

export interface EventPayload {
  title: string;
  description: string;
  event_type: EventType;
  location: string;
  is_virtual?: boolean;
  virtual_link?: string;
  banner_url?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
}

const eventService = {
  // List endpoint wraps results as { data: { events: [...] } }.
  getAll: async (params: EventListParams = {}): Promise<Event[]> => {
    const response = await api.get("/events/", { params });
    return response.data.data.events as Event[];
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data.data as Event;
  },

  // Backend waitlists automatically once max_participants is hit instead of
  // rejecting the request — the response status tells you which happened.
  register: async (id: string): Promise<EventRegistration> => {
    const response = await api.post(`/events/${id}/register`);
    return response.data.data as EventRegistration;
  },

  // Admin-only on the backend.
  create: async (payload: EventPayload): Promise<Event> => {
    const response = await api.post("/events/", payload);
    return response.data.data as Event;
  },

  // Admin-only on the backend.
  update: async (
    id: string,
    payload: Partial<EventPayload>,
  ): Promise<Event> => {
    const response = await api.put(`/events/${id}`, payload);
    return response.data.data as Event;
  },

  // Admin-only on the backend.
  remove: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default eventService;
