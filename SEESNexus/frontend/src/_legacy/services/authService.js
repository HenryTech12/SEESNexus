import api from '../api/axios';

const authService = {
  login: async (email, password) => {
    const params = new URLSearchParams({ username: email, password });
    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data.data;
  },

  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data.data;
  },

  validateToken: async () => {
    const response = await api.get('/auth/validate/token');
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  updateMe: async (payload) => {
    const response = await api.put('/auth/me', payload);
    return response.data.data;
  },

  sendVerificationCode: async (email) => {
    const response = await api.post('/notify/send-code', { email });
    return response.data.data;
  },

  verifyCode: async (email, code) => {
    const response = await api.post('/notify/verify-code', { email, code });
    return response.data.data;
  }
};

export default authService;
