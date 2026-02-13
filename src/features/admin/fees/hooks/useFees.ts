// frontend/src/features/admin/fees/hooks/useFees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as feeApi from "../api/feeApi";
import { useToast } from "../../../../hooks/useToast";
import type { PaymentPayload } from "../types/fee.types";
import { AxiosError } from "axios";

// Define the shape of your Backend Error Response
interface ApiErrorResponse {
  message: string;
}

export const useFeeSummary = (studentId: string) => {
  return useQuery({
    queryKey: ["fees", "summary", studentId],
    queryFn: () => feeApi.getFeeSummary(studentId),
    enabled: !!studentId,
  });
};

export const usePaymentActions = (studentId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast(); // Returns an object { success, error, etc. }

  const payMutation = useMutation({
    mutationFn: ({
      month,
      year,
      data,
    }: {
      month: number;
      year: number;
      data: PaymentPayload;
    }) => feeApi.markFeeAsPaid(studentId, month, year, data),
    onSuccess: () => {
      // Invalidate all fee-related queries
      queryClient.invalidateQueries({ queryKey: ["fees"] });

      // FIXED: Calling the method .success() instead of the object
      toast.success("Success", "Payment recorded successfully");
    },
    // FIXED: Typed 'err' as AxiosError with our custom interface
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const errorMessage = err.response?.data?.message || "Payment failed";

      // FIXED: Calling the method .error() instead of the object
      toast.error("Error", errorMessage);
    },
  });

  return {
    recordPayment: payMutation.mutateAsync,
    isProcessing: payMutation.isPending,
  };
};

export const useFeeDashboard = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ["fees", "dashboard-status", month, year],
    queryFn: () => feeApi.getDashboardPaymentStatus(month, year),
  });
};
