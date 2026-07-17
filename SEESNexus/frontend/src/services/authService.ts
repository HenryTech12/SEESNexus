import api from "../api/axios";
import { User } from "../types";

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  department?: string;
  level?: string;
  role?: string;
}

const authService = {
  // FastAPI's OAuth2PasswordRequestForm expects form-encoded `username`/`password`
  // fields, not JSON — hence URLSearchParams + x-www-form-urlencoded here.
  login: async (email: string, password: string): Promise<LoginResult> => {
    const params = new URLSearchParams({ username: email, password });
    const response = await api.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.data as LoginResult;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const response = await api.post("/auth/register", payload);
    return response.data.data as User;
  },

  validateToken: async (): Promise<{ valid: boolean; user: User }> => {
    const response = await api.get("/auth/validate/token");
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data.data as User;
  },

  updateMe: async (payload: Partial<User>): Promise<User> => {
    const response = await api.put("/auth/me", payload);
    return response.data.data as User;
  },

  sendVerificationCode: async (email: string): Promise<void> => {
    await api.post("/notify/send-code", { email });
  },

  verifyCode: async (email: string, code: string): Promise<void> => {
    await api.post("/notify/verify-code", { email, code });
  },
};

export default authService;
