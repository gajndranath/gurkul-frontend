import axiosInstance from "../../../../api/axiosInstance";
import type { ApiResponse } from "../../../auth/types/auth.types";

export interface SlotChangeRequest {
  _id: string;
  studentId: string;
  requestedSlotId: {
    _id: string;
    name: string;
    timeRange: string;
    monthlyFee: number;
  };
  currentSlotId: {
    _id: string;
    name: string;
    timeRange: string;
  };
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComments?: string;
  createdAt: string;
}

export interface Slot {
  _id: string;
  name: string;
  timeRange: string;
  monthlyFee: number;
  totalSeats: number;
  isActive: boolean;
}

export const requestSlotChange = async (newSlotId: string, reason: string) => {
  const response = await axiosInstance.post<ApiResponse<SlotChangeRequest>>(
    "/student/slot/request-change",
    { newSlotId, reason }
  );
  return response.data.data;
};

export const fetchMySlotChangeHistory = async () => {
  const response = await axiosInstance.get<ApiResponse<SlotChangeRequest[]>>(
    "/student/slot/change-history"
  );
  return response.data.data;
};

// Fetch all available slots for selection
export const fetchAllSlots = async () => {
  const response = await axiosInstance.get<ApiResponse<Slot[]>>("/student/slots");
  return response.data.data;
};
