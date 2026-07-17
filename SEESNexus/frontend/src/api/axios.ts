import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 10000,
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sees_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// While a refresh request is in flight, any other request that fails with
// 401 is parked in `failedQueue` instead of triggering its own refresh call
// (or its own redirect-to-login). Once the in-flight refresh resolves, every
// queued request is retried with the new token; if it fails, they're all
// rejected together.
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

// Marks a request as "already retried once" so a second 401 (e.g. the
// refreshed token also being rejected) doesn't loop forever.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const clearSessionAndRedirect = () => {
  localStorage.removeItem("sees_access_token");
  localStorage.removeItem("sees_refresh_token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      // Already retried with a refreshed token and still unauthorized
      // — give up rather than risk an infinite refresh loop.
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request already triggered a refresh; wait for it to
      // finish and retry this request with whatever token it produces.
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    const refreshToken = localStorage.getItem("sees_refresh_token");
    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use a bare axios call (not `api`) so this request skips the
      // interceptors above — otherwise a 401 here (invalid refresh
      // token) would re-enter this same handler.
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {
          refresh_token: refreshToken,
        },
      );
      const newAccessToken = data.data.access_token;

      localStorage.setItem("sees_access_token", newAccessToken);
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
