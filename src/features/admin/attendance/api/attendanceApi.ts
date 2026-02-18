import axiosInstance from "../../../../api/axiosInstance";
import type { ApiResponse } from "../../../auth/types/auth.types";

export interface AttendanceRecord {
  studentId: string;
  name: string;
  seatNumber?: string;
  shift?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "NOT_MARKED";
  checkInTime?: string;
  checkOutTime?: string;
  attendanceId?: string;
}

export interface DailyAttendanceResponse {
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  records: AttendanceRecord[];
}

export const fetchDailyAttendance = async (date: string) => {
  const response = await axiosInstance.get<ApiResponse<DailyAttendanceResponse>>(
    "/attendance/daily",
    { params: { date } }
  );
  return response.data.data;
};

export const markAttendance = async (data: {
  studentId: string;
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
}) => {
  const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>("/attendance", data);
  return response.data.data;
};
