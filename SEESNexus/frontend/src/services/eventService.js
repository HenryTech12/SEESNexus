import api from '../api/axios';

const eventService = {
  getAll: async ({ page, limit, event_type, upcoming_only } = {}) => {
    const params = { page, limit, event_type, upcoming_only };
    const response = await api.get('/events/', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/events/', payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/events/${id}`, payload);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data.data;
  },

  register: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data.data;
  },

  getParticipants: async (id) => {
    const response = await api.get(`/admin/events/${id}/participants`);
    return response.data.data;
  }
};

export default eventService;
