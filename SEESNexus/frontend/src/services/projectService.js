import api from '../api/axios';

const projectService = {
  getAll: async ({ page, limit, status, category } = {}) => {
    const params = { page, limit, status, category };
    const response = await api.get('/projects/', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/projects/', payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/projects/${id}`, payload);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data.data;
  }
};

export default projectService;
