import api from '../api/axios';

const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  getUsers: async ({ page, limit, role } = {}) => {
    const params = { page, limit, role };
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  deactivateUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data.data;
  },

  getAllLoans: async ({ page, limit, status } = {}) => {
    const params = { page, limit, status };
    const response = await api.get('/admin/loans', { params });
    return response.data.data;
  },

  approveLoan: async (loanId) => {
    const response = await api.put(`/admin/loans/${loanId}/approve`);
    return response.data.data;
  },

  rejectLoan: async (loanId, reason) => {
    const response = await api.put(`/admin/loans/${loanId}/reject`, { reason });
    return response.data.data;
  }
};

export default adminService;
