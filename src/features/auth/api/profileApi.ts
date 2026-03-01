import axiosInstance from "../../../api/axiosInstance";
import type { ApiResponse } from "../types/auth.types";

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  // add more fields as needed
}

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  tenantId?: string;
  // add more fields as needed
}

export const fetchStudentProfile = async () => {
  const { data } =
    await axiosInstance.get<ApiResponse<StudentProfile>>("/student-auth/profile");
  return data.data;
};

export const fetchAdminProfile = async () => {
  const { data } =
    await axiosInstance.get<ApiResponse<AdminProfile>>("/admin/profile");
  return data.data;
};
