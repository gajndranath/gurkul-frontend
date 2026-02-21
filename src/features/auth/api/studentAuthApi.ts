import axiosInstance from "../../../api/axiosInstance";
import type { AuthResponse, ApiResponse } from "../types/auth.types";

export interface RegisterStudentPayload {
  name: string;
  email: string;
  phone: string;
  address?: string;
  fatherName?: string;
  password?: string;
}

export interface RequestOtpPayload {
  email: string;
  purpose?: "LOGIN" | "RESET" | "VERIFY";
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  setPassword?: string;
}

export interface LoginStudentPayload {
  email: string;
  password: string;
}

export const registerStudent = async (payload: RegisterStudentPayload) => {
  const { data } = await axiosInstance.post<
    ApiResponse<{ email: string; libraryId: string; message: string }>
  >("/student-auth/register", payload);
  return data;
};

export const requestStudentOtp = async (payload: RequestOtpPayload) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/student-auth/request-otp",
    payload,
  );
  return data;
};

export const verifyStudentOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/student-auth/verify-otp",
    payload,
  );
  return data;
};

export const loginStudent = async (payload: LoginStudentPayload) => {
  const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/student-auth/login",
    payload,
  );
  return data;
};

export const logoutStudent = async () => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/student-auth/logout",
  );
  return data;
};

export const refreshStudent = async () => {
  const { data } = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
    "/student-auth/refresh-token",
  );
  return data;
};
