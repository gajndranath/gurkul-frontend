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
      
      // Inject Tenant ID for all requests (authenticated or not, if available)
      const tenantId = import.meta.env.VITE_TENANT_ID;
      if (tenantId) {
        config.headers["X-Tenant-ID"] = tenantId;
      }
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
    
    // Handle 403 Forbidden - likely inactive account or invalid role
    if (error.response && error.response.status === 403) {
      useToast().error("Access Denied", "Your account may be inactive or unauthorized.");
      useSessionStore.getState().logout();
    }
    // Optionally log error
    return Promise.reject(error);
  },
);

export default axiosInstance;
