import axios from "axios";
import { tokenFor, clearSession } from "./session";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20000,
});
api.interceptors.request.use((config) => {
  const role =
    config.url.startsWith("/admin") || config.url === "/bookings/scan"
      ? "admin"
      : "student";
  const token = tokenFor(role);
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.endsWith("/login")
    ) {
      clearSession();
      window.location.assign("/?expired=1");
    }
    return Promise.reject(error);
  },
);
export default api;
