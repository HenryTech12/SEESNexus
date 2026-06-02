import api from '../api/axios';

const articleService = {
  getAll: async ({ page, limit, tag } = {}) => {
    const params = { page, limit, tag };
    const response = await api.get('/articles/', { params });
    return response.data.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/articles/', payload);
    return response.data.data;
  },

  update: async (slug, payload) => {
    const response = await api.put(`/articles/${slug}`, payload);
    return response.data.data;
  },

  remove: async (slug) => {
    const response = await api.delete(`/articles/${slug}`);
    return response.data.data;
  }
};

export default articleService;
