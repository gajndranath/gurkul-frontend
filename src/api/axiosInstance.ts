import { useSessionStore } from "../stores/sessionStore";
import { AuthService } from "../services/AuthService";
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
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token might be expired
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { role } = useSessionStore.getState();
        let newAccessToken = "";

        // 1. Attempt to refresh token based on role
        if (role === "STUDENT") {
          const { refreshStudent } = await import("../features/auth/api/studentAuthApi");
          const response = await refreshStudent();
          newAccessToken = response.data.accessToken;
        } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
          const { refreshAdmin } = await import("../features/auth/api/adminAuthApi");
          const response = await refreshAdmin();
          newAccessToken = response.data.accessToken;
        }

        if (newAccessToken) {
          // 2. Update session
          AuthService.setSession({ token: newAccessToken });

          // 3. Retry
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        AuthService.logout();
        useToast().error("Session Expired", "Please log in again.");
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 403) {
      useToast().error("Access Denied", "Your account may be inactive or unauthorized.");
      AuthService.logout();
    }
    
    return Promise.reject(error);
  },
);

export default axiosInstance;
