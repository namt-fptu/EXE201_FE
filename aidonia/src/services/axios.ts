// src/services/axios.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig, AxiosError } from "axios";

// 1) Đọc .env + chuẩn hoá baseURL
const raw =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // bạn có thể dùng biến này
  "http://localhost:5000/api";

// Bỏ mọi dấu "/" ở cuối để tránh lỗi ghép chuỗi
const baseURL = raw.replace(/\/+$/, "");

// (Tùy chọn) Log để kiểm tra nhanh trên trình duyệt
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[API] baseURL =", baseURL);
}

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  // timeout: 15000, // nếu muốn
});

// 2) Request interceptor: gắn token + đảm bảo URL có "/" đầu
const handleBefore = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // a) đảm bảo đường dẫn con luôn có "/" đầu
  //    ví dụ: api.get("posts/1") -> "/posts/1"
  if (
    config.url &&
    !config.url.startsWith("http") &&
    !config.url.startsWith("/") &&
    typeof config.url === "string"
  ) {
    config.url = `/${config.url}`;
  }

  // b) gắn Authorization khi có token
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")?.replaceAll('"', "")
      : undefined;

  if (!config.headers) config.headers = new AxiosHeaders();

  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  } else {
    // đảm bảo không gửi chuỗi "Bearer undefined"
    (config.headers as AxiosHeaders).delete?.("Authorization");
  }

  return config;
};

api.interceptors.request.use(handleBefore, (error) => Promise.reject(error));

// 3) Response interceptor: refresh token khi 401 và replay request
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Dynamic import để tránh circular dependency
        const { refreshAccessToken } = await import("@/services/auth");
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Cập nhật header cho request gốc
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return api.request(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// (Tùy chọn) helper nếu muốn dùng ở nơi khác
export const ensureSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export default api;
