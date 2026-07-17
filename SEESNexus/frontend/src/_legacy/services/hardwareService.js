import api from '../api/axios';

const hardwareService = {
  getAll: async ({ page, limit, category, status } = {}) => {
    const params = { page, limit, category, status };
    const response = await api.get('/hardware/', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hardware/${id}`);
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post('/hardware/', payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/hardware/${id}`, payload);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/hardware/${id}`);
    return response.data.data;
  },

  requestLoan: async (id, { purpose, expected_return_date }) => {
    const response = await api.post(`/hardware/${id}/loan`, { purpose, expected_return_date });
    return response.data.data;
  },

  getMyLoans: async () => {
    const response = await api.get('/hardware/loans/my');
    return response.data.data;
  },

  returnLoan: async (loanId) => {
    const response = await api.put(`/hardware/loans/${loanId}/return`);
    return response.data.data;
  }
};

export default hardwareService;
