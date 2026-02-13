import axiosInstance from "./axiosInstance";
import type {
  Student,
  StudentListResponse,
} from "../features/admin/students/types";

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
};

export const registerStudent = async (data: Partial<StudentFormData>) => {
  const { data: result } = await axiosInstance.post("/students", data);
  return result;
};

export const updateStudent = async (
  id: string,
  data: Partial<StudentFormData>,
) => {
  const { data: result } = await axiosInstance.put(`/students/${id}`, data);
  return result;
};

export const changeSlot = async (studentId: string, slotId: string) => {
  const { data: result } = await axiosInstance.post(
    `/students/${studentId}/change-slot`,
    { slotId },
  );
  return result;
};

export const overrideFee = async (studentId: string, fee: number) => {
  const { data: result } = await axiosInstance.post(
    `/students/${studentId}/override-fee`,
    { fee },
  );
  return result;
};

export const archiveStudent = async (studentId: string) => {
  const { data: result } = await axiosInstance.post(
    `/students/${studentId}/archive`,
  );
  return result;
};

export const reactivateStudent = async (studentId: string) => {
  const { data: result } = await axiosInstance.post(
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
export const getStudent = async (id: string): Promise<Student> => {
  const { data } = await axiosInstance.get<Student>(`/students/${id}`);
  return data;
};

// ✅ Get student fee summary
export const getStudentFeeSummary = async (studentId: string) => {
  const { data } = await axiosInstance.get(`/students/${studentId}/fees`);
  return data;
};
