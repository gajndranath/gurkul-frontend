import axiosInstance from "./axiosInstance";
import type { StudentListResponse } from "../features/admin/students/types";

// Inline StudentFormData type to avoid import issues
export type StudentFormData = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  fatherName?: string;
  slotId: string;
  seatNumber?: string;
  monthlyFee: number;
  joiningDate?: string;
  notes?: string;
  tags?: string[];
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export const registerStudent = async (data: Partial<StudentFormData>) => {
  const { data: result } = await axiosInstance.post("/students", data);
  return result;
};

export const updateStudent = async (
  id: string,
  data: Partial<StudentFormData>,
) => {
  const { data: result } = await axiosInstance.patch(`/students/${id}`, data);
  return result;
};

export const changeSlot = async (studentId: string, slotId: string) => {
  const { data: result } = await axiosInstance.patch(
    `/students/${studentId}/change-slot`,
    { slotId },
  );
  return result;
};

export const overrideFee = async (studentId: string, fee: number) => {
  const { data: result } = await axiosInstance.patch(
    `/students/${studentId}/override-fee`,
    { fee },
  );
  return result;
};

export const archiveStudent = async (studentId: string, reason?: string) => {
  const { data: result } = await axiosInstance.patch(
    `/students/${studentId}/archive`,
    { reason },
  );
  return result;
};

export const reactivateStudent = async (studentId: string) => {
  const { data: result } = await axiosInstance.patch(
    `/students/${studentId}/reactivate`,
  );
  return result;
};

export interface GetStudentsParams {
  search?: string;
  slotId?: string;
  status?: string;
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

export const getStudents = async (
  params: GetStudentsParams = {},
): Promise<StudentListResponse> => {
  const { data } = await axiosInstance.get<StudentListResponse>("/students", {
    params,
  });
  return data;
};

// ✅ Get single student by ID
export const getStudent = async (id: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/students/${id}`);
  return data.data; // This returns { student, feeSummary }
};

// ✅ Get student fee summary
export const getStudentFeeSummary = async (studentId: string) => {
  const { data } = await axiosInstance.get(`/fees/summary/${studentId}`);
  return data;
};
