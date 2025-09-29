import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const config = {
  baseURL: baseUrl,
};

const api = axios.create(config);

// handle before call API
const handleBefore = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")?.replaceAll('"', "")
      : undefined;
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  config.headers.set("Authorization", `Bearer ${token}`);
  return config;
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Dynamic import to avoid circular dependency
        const { refreshAccessToken } = await import("@/services/auth");
        const newToken = await refreshAccessToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(handleBefore, (error) => Promise.reject(error));
api.defaults.withCredentials = true;

export default api;
