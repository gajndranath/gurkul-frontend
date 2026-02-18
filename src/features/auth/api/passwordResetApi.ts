import axiosInstance from "@/api/axiosInstance";
import type { ApiResponse } from "../types/auth.types";

export const forgotPassword = async (email: string) => {
  const response = await axiosInstance.post<ApiResponse<Record<string, never>>>("/admin/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (password: string, token: string) => {
  const response = await axiosInstance.put<ApiResponse<Record<string, never>>>(`/admin/reset-password/${token}`, {
    password,
  });
  return response.data;
};
