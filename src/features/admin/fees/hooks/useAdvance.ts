// frontend/src/features/admin/fees/hooks/useAdvance.ts

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as feeApi from "../api/feeApi";
import * as studentAdminApi from "@/api/studentsAdminApi"; // ✅ Now has getStudents()
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";
import type { Student } from "@/features/admin/students/types";

interface ApiErrorResponse {
  message: string;
}

export interface AdvanceBalance {
  studentId: string;
  studentName: string;
  studentPhone: string;
  totalAmount: number;
  remainingAmount: number;
  usedAmount: number;
  monthsCovered: number;
  lastAppliedMonth?: {
    month: number;
    year: number;
  };
}

interface ApplyAdvancePayload {
  studentId: string;
  month: number;
  year: number;
  amount: number;
}

// ✅ Query Keys
export const advanceKeys = {
  all: ["advance"] as const,
  balances: () => [...advanceKeys.all, "balances"] as const,
  student: (studentId: string) =>
    [...advanceKeys.all, "student", studentId] as const,
};

// ✅ Get all students with advance balances
export const useAllAdvanceBalances = () => {
  const toast = useToast();

  return useQuery({
    queryKey: advanceKeys.balances(),
    queryFn: async (): Promise<AdvanceBalance[]> => {
      try {
        // 1. Fetch all active students - ✅ NOW WORKING!
        const response = await studentAdminApi.getStudents({
          limit: 1000,
          status: "ACTIVE",
        });

        const students = response?.students || [];
        if (students.length === 0) return [];

        // 2. Fetch fee summary for each student (parallel)
        const summaries = await Promise.all(
          students.map(async (student: Student) => {
            try {
              const summary = await feeApi.getFeeSummary(
                student._id || student.id,
              );
              return { student, summary };
            } catch {
              return null;
            }
          }),
        );

        // 3. Filter students with advance balance > 0
        const advanceBalances = summaries
          .filter(
            (item): item is NonNullable<typeof item> =>
              item !== null &&
              item.summary?.advance !== null &&
              (item.summary.advance?.remainingAmount || 0) > 0,
          )
          .map(({ student, summary }) => ({
            studentId: student._id || student.id,
            studentName: student.name,
            studentPhone: student.phone || "",
            totalAmount: summary.advance?.totalAmount || 0,
            remainingAmount: summary.advance?.remainingAmount || 0,
            usedAmount:
              (summary.advance?.totalAmount || 0) -
              (summary.advance?.remainingAmount || 0),
            monthsCovered: summary.advance?.monthsCovered?.length || 0,
            lastAppliedMonth: summary.advance?.lastAppliedMonth,
          }));

        return advanceBalances;
      } catch (error) {
        console.error("Failed to fetch advance balances:", error);
        toast.error("Error", "Failed to load advance balances");
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ✅ Get single student's advance balance
export const useStudentAdvance = (studentId: string) => {
  return useQuery({
    queryKey: advanceKeys.student(studentId),
    queryFn: async (): Promise<AdvanceBalance | null> => {
      if (!studentId) return null;

      try {
        const summary = await feeApi.getFeeSummary(studentId);

        if (!summary?.advance || summary.advance.remainingAmount === 0) {
          return null;
        }

        return {
          studentId,
          studentName: summary.student?.name || "Unknown",
          studentPhone: summary.student?.phone || "",
          totalAmount: summary.advance.totalAmount,
          remainingAmount: summary.advance.remainingAmount,
          usedAmount:
            summary.advance.totalAmount - summary.advance.remainingAmount,
          monthsCovered: summary.advance.monthsCovered?.length || 0,
          lastAppliedMonth: summary.advance.lastAppliedMonth,
        };
      } catch {
        return null;
      }
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Add Advance Mutation
export const useAddAdvance = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      studentId,
      amount,
      remarks,
    }: {
      studentId: string;
      amount: number;
      remarks?: string;
    }) => feeApi.addAdvance(studentId, amount, remarks),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.balances() });
      queryClient.invalidateQueries({
        queryKey: advanceKeys.student(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: ["fees", "summary", variables.studentId],
      });

      toast.success("Success", "Advance added successfully");
    },

    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.message || "Failed to add advance";
      toast.error("Error", message);
    },
  });
};

// ✅ Apply Advance Mutation
export const useApplyAdvance = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      studentId,
      month,
      year,
      amount,
    }: ApplyAdvancePayload) => feeApi.applyAdvance(studentId, month, year, amount),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.balances() });
      queryClient.invalidateQueries({
        queryKey: advanceKeys.student(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: ["fees", "summary", variables.studentId],
      });
      queryClient.invalidateQueries({ queryKey: ["fees", "dashboard"] });

      toast.success("Success", "Advance applied successfully");
    },

    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = err.response?.data?.message || "Failed to apply advance";
      toast.error("Error", message);
    },
  });
};

// ✅ Get pending months for a student (where advance can be applied)
export const usePendingMonths = (studentId: string) => {
  const { data: summary } = useQuery({
    queryKey: ["fees", "summary", studentId],
    queryFn: () => feeApi.getFeeSummary(studentId),
    enabled: !!studentId,
  });

  const pendingMonths = React.useMemo(() => {
    if (!summary?.feeHistory) return [];

    return summary.feeHistory
      .filter((fee) => fee.status === "PENDING" || fee.status === "DUE")
      .map((fee) => ({
        month: fee.month,
        year: fee.year,
        amount: fee.totalAmount,
        label: `${fee.month + 1}/${fee.year}`,
        status: fee.status,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  }, [summary]);

  return {
    pendingMonths,
    isLoading: !summary,
  };
};
