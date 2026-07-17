import api from "../api/axios";
import { User, UserRole, HardwareLoan, LoanStatus } from "../types";

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
}

export interface AdminLoanListParams {
  page?: number;
  limit?: number;
  status?: LoanStatus;
}

export interface DashboardStats {
  total_users: number;
  total_projects: number;
  // Loans currently checked out (APPROVED). Pending requests are counted
  // separately in pending_loans, not folded into this number.
  active_loans: number;
  pending_loans: number;
  upcoming_events: number;
  total_articles: number;
}

const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/admin/dashboard");
    return response.data.data as DashboardStats;
  },


  // GET /users and PUT/.../approve under /hardware don't exist on the
  // backend — all admin-only user/loan management lives under /admin.
  // Backend defaults to limit=10 when omitted, so callers that want "all"
  // records must pass a limit explicitly (100 is the backend's own ceiling).
  getUsers: async (params: AdminUserListParams = {}): Promise<User[]> => {
    const response = await api.get("/admin/users", { params });
    return response.data.data.users as User[];
  },

  updateUserRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data.data as User;
  },

  deactivateUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllLoans: async (params: AdminLoanListParams = {}): Promise<HardwareLoan[]> => {
    const response = await api.get("/admin/loans", { params });
    return response.data.data.loans as HardwareLoan[];
  },

  approveLoan: async (loanId: string): Promise<HardwareLoan> => {
    const response = await api.put(`/admin/loans/${loanId}/approve`);
    return response.data.data as HardwareLoan;
  },

  rejectLoan: async (loanId: string, reason?: string): Promise<HardwareLoan> => {
    const response = await api.put(`/admin/loans/${loanId}/reject`, {
      reason,
    });
    return response.data.data as HardwareLoan;
  },
};

export default adminService;
