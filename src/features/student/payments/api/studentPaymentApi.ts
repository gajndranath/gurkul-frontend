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

export const fetchMyPayments = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get<ApiResponse<PaymentHistoryResponse>>(
    `/student/payments`,
    {
      params: { page, limit },
    }
  );
  return response.data.data;
};
