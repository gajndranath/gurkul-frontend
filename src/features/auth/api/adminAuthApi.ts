import axiosInstance from "../../../api/axiosInstance";
import type { AuthResponse, ApiResponse } from "../types/auth.types";

export interface LoginAdminPayload {
  email: string;
  password: string;
}

export const loginAdmin = async (payload: LoginAdminPayload) => {
  const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/admin/login",
    payload,
  );
  return data;
};

export const logoutAdmin = async () => {
  const { data } = await axiosInstance.post<ApiResponse<null>>("/admin/logout");
  return data;
};
