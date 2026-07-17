import api from "../api/axios";
import {
  Hardware,
  HardwareCategory,
  HardwareStatus,
  HardwareLoan,
} from "../types";

export interface HardwareListParams {
  page?: number;
  limit?: number;
  category?: HardwareCategory;
  status?: HardwareStatus;
}

export interface LoanRequestPayload {
  purpose: string;
  expected_return_date: string;
}

export interface HardwareCreatePayload {
  name: string;
  description?: string;
  serial_number: string;
  category: HardwareCategory;
  status?: HardwareStatus;
  image_url?: string;
  quantity: number;
}

// available_quantity is intentionally omitted — the backend ignores it on
// update and derives it from quantity on create.
export type HardwareUpdatePayload = Partial<HardwareCreatePayload>;

const hardwareService = {
  // List endpoint wraps results as { data: { hardware: [...] } }, not a bare array.
  getAll: async (params: HardwareListParams = {}): Promise<Hardware[]> => {
    const response = await api.get("/hardware/", { params });
    return response.data.data.hardware as Hardware[];
  },

  getById: async (
    id: string,
  ): Promise<Hardware & { loan_history_count?: number }> => {
    const response = await api.get(`/hardware/${id}`);
    return response.data.data;
  },

  // Admin-only on the backend.
  create: async (payload: HardwareCreatePayload): Promise<Hardware> => {
    const response = await api.post("/hardware/", payload);
    return response.data.data as Hardware;
  },

  // Admin-only on the backend.
  update: async (
    id: string,
    payload: HardwareUpdatePayload,
  ): Promise<Hardware> => {
    const response = await api.put(`/hardware/${id}`, payload);
    return response.data.data as Hardware;
  },

  // Admin-only on the backend; rejected with 400 if the item has an active loan.
  remove: async (id: string): Promise<void> => {
    await api.delete(`/hardware/${id}`);
  },

  // POST /hardware/{id}/loan with { purpose, expected_return_date }.
  requestLoan: async (
    id: string,
    payload: LoanRequestPayload,
  ): Promise<HardwareLoan> => {
    const response = await api.post(`/hardware/${id}/loan`, payload);
    return response.data.data as HardwareLoan;
  },

  getMyLoans: async (): Promise<HardwareLoan[]> => {
    const response = await api.get("/hardware/loans/my");
    return response.data.data as HardwareLoan[];
  },

  returnLoan: async (loanId: string): Promise<HardwareLoan> => {
    const response = await api.put(`/hardware/loans/${loanId}/return`);
    return response.data.data as HardwareLoan;
  },

  // Admin-only loan management (list all / approve / reject) lives under
  // /admin, not /hardware — see adminService.ts.
};

export default hardwareService;
