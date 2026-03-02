import axiosInstance from "../../../../api/axiosInstance";
import type { ApiResponse } from "../../../auth/types/auth.types";

export interface StudentPayment {
  _id: string;
  month: number;
  year: number;
  baseFee: number;
  dueCarriedForwardAmount: number;
  status: "PAID" | "DUE" | "PENDING";
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
}

export interface PaymentHistoryResponse {
  payments: StudentPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeeCalendarItem {
  month: number;
  year: number;
  label: string;
  hasRecord: boolean;
  status: "PAID" | "DUE" | "PENDING" | "NO_RECORD";
  baseFee: number;
  dueCarriedForward: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
  remarks: string | null;
  coveredByAdvance: boolean;
  locked: boolean;
  feeDueDate: string;
  daysOverdue: number;
}

export interface FeeCalendarSummary {
  year: number;
  totalPaid: number;
  totalDue: number;
  totalPending: number;
  paidMonths: number;
  dueMonths: number;
  pendingMonths: number;
}

export interface FeeCalendarResponse {
  calendar: FeeCalendarItem[];
  summary: FeeCalendarSummary;
  year: number;
}

export const fetchMyPayments = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get<ApiResponse<PaymentHistoryResponse>>(
    `/student-auth/payments`,
    {
      params: { page, limit },
    }
  );
  return response.data.data;
};

export const fetchMyFeeCalendar = async (year?: number) => {
  const response = await axiosInstance.get<ApiResponse<FeeCalendarResponse>>(
    `/student-auth/fee-calendar`,
    {
      params: { year },
    }
  );
  return response.data.data;
};
