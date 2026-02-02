import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const studentToken = localStorage.getItem("studentToken");

    // Admin routes use admin token
    if (config.url.startsWith("/admin") && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    // Student routes use student token
    if (config.url.startsWith("/students") && studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
