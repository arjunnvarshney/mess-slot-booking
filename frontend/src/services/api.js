import axios from "axios";

const api = axios.create({
  baseURL: "https://mess-slot-booking-api.onrender.com/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export default api;
