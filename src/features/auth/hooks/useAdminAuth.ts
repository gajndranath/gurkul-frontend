import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAdmin, logoutAdmin } from "../api/adminAuthApi";
import { useSessionStore } from "../../../stores/sessionStore";

export const useLoginAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      const rememberMe = useSessionStore.getState().rememberMe;
      useSessionStore.getState().clearSession(); // Always clear session before login
      if (data.data.accessToken && data.data.admin) {
        useSessionStore.getState().login(
          data.data.accessToken,
          data.data.admin._id,
          data.data.admin.role,
          Date.now() + 1000 * 60 * 60 * 24, // 24h expiry (adjust as needed)
          undefined,
          data.data.admin,
          rememberMe,
        );
      }
      queryClient.invalidateQueries();
    },
  });
};

export const useLogoutAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      useSessionStore.getState().logout();
      queryClient.clear();
    },
  });
};
