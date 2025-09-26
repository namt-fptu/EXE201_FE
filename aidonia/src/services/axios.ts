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

api.interceptors.request.use(handleBefore, (error) => Promise.reject(error));

export default api;
