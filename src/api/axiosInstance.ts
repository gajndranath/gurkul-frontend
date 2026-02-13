import { useSessionStore } from "../stores/sessionStore";
import { useToast } from "../hooks/useToast";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useSessionStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
      // ...existing code...
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Show toast, do NOT auto logout or redirect
      useToast().error("Session expired", "Please log in again.");
    }
    // Optionally log error
    return Promise.reject(error);
  },
);

export default axiosInstance;
