// frontend/src/features/admin/fees/api/feeApi.ts

import axiosInstance from "@/api/axiosInstance";
import type { PaymentPayload } from "../types/fee.types";

export interface FeeHistoryItem {
  month: number;
  year: number;
  baseFee: number;
  dueCarriedForward: number;
  totalAmount: number;
  status: "PAID" | "DUE" | "PENDING";
  paidAmount?: number;
  paymentDate?: string;
  coveredByAdvance: boolean;
  locked: boolean;
}

export interface FeeSummaryResponse {
  student?: {
    name: string;
    phone?: string;
    monthlyFee: number;
  };
  feeHistory: FeeHistoryItem[];
  advance?: {
    totalAmount: number;
    remainingAmount: number;
    usedAmount: number;
    monthsCovered?: Array<{ month: number; year: number }>;
    lastAppliedMonth?: {
      month: number;
      year: number;
    };
  };
  currentDue?: {
    totalDueAmount: number;
    monthsDue: string[];
    reminderDate?: string;
  };
}

export const getFeeSummary = async (
  studentId: string,
): Promise<FeeSummaryResponse> => {
  const { data } = await axiosInstance.get(`/fees/summary/${studentId}`);
  return data.data;
};

export const markFeeAsPaid = async (
  studentId: string,
  month: number,
  year: number,
  paymentData: PaymentPayload,
) => {
  const { data } = await axiosInstance.patch(
    `/fees/${studentId}/${month}/${year}/paid`,
    paymentData,
  );
  return data.data;
};

export const getDashboardPaymentStatus = async (
  month?: number,
  year?: number,
) => {
  const params = { month, year };
  const { data } = await axiosInstance.get(`/fees/dashboard-status`, {
    params,
  });
  return data.data;
};

export const addAdvance = async (
  studentId: string,
  amount: number,
  remarks?: string,
) => {
  const { data } = await axiosInstance.post(`/fees/${studentId}/advance`, {
    amount,
    remarks,
  });
  return data.data;
};

export const markFeeAsDue = async (
  studentId: string,
  month: number,
  year: number,
  reminderDate: Date,
) => {
  const { data } = await axiosInstance.patch(
    `/fees/${studentId}/${month}/${year}/due`,
    { reminderDate },
  );
  return data.data;
};
