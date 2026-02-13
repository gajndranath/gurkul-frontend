import axiosInstance from "./axiosInstance";
import type { Student, StudentListResponse } from "../features/students/types";
import type { StudentFormValues } from "../features/admin/students/studentFormWidget/type/AdminStudentForm.types";

export const archiveStudent = async (id: string, reason: string) => {
  await axiosInstance.post(`/students/${id}/archive`, { reason });
};

export const reactivateStudent = async (id: string) => {
  await axiosInstance.post(`/students/${id}/reactivate`);
};

export const registerStudent = async (data: StudentFormValues) => {
  await axiosInstance.post(`/students`, data);
};

export const updateStudent = async (id: string, data: StudentFormValues) => {
  await axiosInstance.put(`/students/${id}`, data);
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

export const getStudent = async (id: string): Promise<Student> => {
  const { data } = await axiosInstance.get<Student>(`/students/${id}`);
  return data;
};
