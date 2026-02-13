// frontend/src/features/admin/fees/hooks/useReceipt.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import * as receiptApi from "../api/receiptApi";

export const receiptKeys = {
  all: ["receipts"] as const,
  details: (studentId: string, month: number, year: number) =>
    [...receiptKeys.all, "details", studentId, month, year] as const,
  list: (studentId: string) => [...receiptKeys.all, "list", studentId] as const,
  number: (receiptNumber: string) =>
    [...receiptKeys.all, "number", receiptNumber] as const,
};

/**
 * Get receipt details for a specific payment
 */
export const useReceiptDetails = (
  studentId: string,
  month: number,
  year: number,
) => {
  return useQuery({
    queryKey: receiptKeys.details(studentId, month, year),
    queryFn: () => receiptApi.getReceiptDetails(studentId, month, year),
    enabled: !!studentId && month >= 0 && year > 2000,
    staleTime: Infinity, // Receipts never change
  });
};

/**
 * Get all receipts for a student
 */
export const useStudentReceipts = (
  studentId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: [...receiptKeys.list(studentId), params],
    queryFn: () => receiptApi.getStudentReceipts(studentId, params),
    enabled: !!studentId,
  });
};

/**
 * Download receipt as PDF
 */
export const useDownloadReceipt = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      studentId,
      month,
      year,
    }: {
      studentId: string;
      month: number;
      year: number;
    }) => receiptApi.downloadReceiptPDF(studentId, month, year),

    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${variables.studentId}-${variables.month + 1}-${variables.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Success", "Receipt downloaded successfully");
    },

    onError: () => {
      toast.error("Error", "Failed to download receipt");
    },
  });
};

/**
 * Send receipt via email
 */
export const useSendReceiptEmail = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      studentId,
      month,
      year,
      email,
    }: {
      studentId: string;
      month: number;
      year: number;
      email?: string;
    }) => receiptApi.sendReceiptEmail(studentId, month, year, email),

    onSuccess: () => {
      toast.success("Success", "Receipt sent via email");
    },

    onError: () => {
      toast.error("Error", "Failed to send receipt");
    },
  });
};
