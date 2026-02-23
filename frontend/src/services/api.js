import axios from "axios";

const api = axios.create({
  baseURL: "https://mess-slot-booking-api.onrender.com/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const studentToken = localStorage.getItem("studentToken");
  const token = adminToken || studentToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
