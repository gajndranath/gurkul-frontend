import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerStudent,
  requestStudentOtp,
  verifyStudentOtp,
  loginStudent,
  logoutStudent,
} from "../api/studentAuthApi";
import { useSessionStore } from "../../../stores/sessionStore";

export const useRegisterStudent = () => {
  return useMutation({
    mutationFn: registerStudent,
  });
};

export const useRequestStudentOtp = () => {
  return useMutation({
    mutationFn: requestStudentOtp,
  });
};

export const useVerifyStudentOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyStudentOtp,
    onSuccess: (data) => {
      if (data.data.accessToken && data.data.student) {
        useSessionStore.getState().login(
          data.data.accessToken,
          data.data.student._id,
          "STUDENT",
          Date.now() + 1000 * 60 * 60 * 24, // 24h expiry (adjust as needed)
          data.data.student,
        );
      }
      queryClient.invalidateQueries();
    },
  });
};

export const useLoginStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      const rememberMe = useSessionStore.getState().rememberMe;
      useSessionStore.getState().clearSession(); // Always clear session before login
      if (data.data.accessToken && data.data.student) {
        useSessionStore.getState().login(
          data.data.accessToken,
          data.data.student._id,
          "STUDENT",
          Date.now() + 1000 * 60 * 60 * 24, // 24h expiry (adjust as needed)
          data.data.student,
          undefined,
          rememberMe,
        );
      }
      queryClient.invalidateQueries();
    },
  });
};

export const useLogoutStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutStudent,
    onSuccess: () => {
      useSessionStore.getState().logout();
      queryClient.clear();
    },
  });
};
