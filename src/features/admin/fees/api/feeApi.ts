// frontend/src/features/admin/fees/api/feeApi.ts

import axiosInstance from "@/api/axiosInstance";
import type { PaymentPayload, FeeHistoryItem } from "../types/fee.types";

export type { FeeHistoryItem };

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
  totals?: {
    totalPaid: number;
    totalDue: number;
    totalPending: number;
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

export const applyAdvance = async (
  studentId: string,
  month: number,
  year: number,
  amount?: number,
) => {
  const { data } = await axiosInstance.post(`/fees/${studentId}/advance/apply`, {
    month,
    year,
    amount,
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

/** ✅ Get full-year calendar grid for a student */
export const getFeeCalendar = async (studentId: string, year?: number) => {
  const params = year ? { year } : {};
  const { data } = await axiosInstance.get(`/fees/calendar/${studentId}`, { params });
  return data.data as {
    calendar: import("../types/fee.types").FeeCalendarMonth[];
    summary: {
      year: number;
      totalPaid: number;
      totalDue: number;
      totalPending: number;
      paidMonths: number;
      dueMonths: number;
      pendingMonths: number;
    };
    year: number;
  };
};

export interface OverdueStudent {
  dueRecordId: string;
  studentId: string;
  name: string;
  phone?: string;
  email?: string;
  libraryId?: string;
  monthlyFee: number;
  monthsDue: string[];
  totalDueAmount: number;
  daysOverdue: number;
  lastReminderSentAt?: string | null;
  nextReminderDue?: string | null;
  reminderCount: number;
  escalationLevel: number;
  urgency: "green" | "mild" | "yellow" | "orange" | "red" | "critical";
  dueSince?: string | null;
}

export interface OverdueSummaryResponse {
  students: OverdueStudent[];
  totals: {
    totalStudentsOverdue: number;
    totalOutstandingAmount: number;
    critical: number;
    red: number;
    orange: number;
    yellow: number;
    mild: number;
  };
}

/** ✅ Get all students with overdue fees, sorted worst-first */
export const getOverdueSummary = async (): Promise<OverdueSummaryResponse> => {
  const { data } = await axiosInstance.get("/fees/overdue-summary");
  return data.data as OverdueSummaryResponse;
};
