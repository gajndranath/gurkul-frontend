// frontend/src/features/admin/fees/hooks/useDueTracking.ts

import { useMemo } from "react";
import { useFeeDashboard } from "./useFeeDashboard";
import {
  calculateDaysOverdue,
  getUrgencyLevel,
  calculateDueSummary,
} from "../lib/dueCalculations";
import { sortByUrgency } from "../lib/feeUtils";
import type {
  DueRecord,
  DueSummaryStats,
  DueFilters,
  FeeDashboardDetail,
} from "../types/fee.types";

interface UseDueTrackingReturn {
  dueRecords: DueRecord[];
  summary: DueSummaryStats;
  isLoading: boolean;
  refetch: () => void;
  filteredRecords: (filters?: DueFilters) => DueRecord[];
}

export const useDueTracking = (): UseDueTrackingReturn => {
  const { data, isLoading, refetch } = useFeeDashboard();

  // ✅ Step 1: Transform dashboard data into DueRecord[]
  const dueRecords = useMemo<DueRecord[]>(() => {
    if (!data?.details) return [];

    const records = data.details
      .filter((item: FeeDashboardDetail) => item.status === "DUE")
      .map((item: FeeDashboardDetail) => {
        const daysOverdue = calculateDaysOverdue(item.month, item.year);
        const urgency = getUrgencyLevel(daysOverdue);

        // Extract phone/email from studentStatus (if available)
        // Note: studentStatus might contain slot info, not contact details
        // We'll enhance this later when we join with student data

        return {
          studentId: item.studentId,
          studentName: item.studentName,
          studentPhone: undefined, // Will be populated from student API later
          studentEmail: undefined, // Will be populated from student API later
          month: item.month,
          year: item.year,
          totalAmount: item.totalAmount,
          dueDate: new Date(item.year, item.month + 1, 0),
          daysOverdue,
          urgency,
          status: item.status,
        };
      });

    // Sort by most overdue first
    return sortByUrgency(records);
  }, [data]);

  // ✅ Step 2: Calculate summary statistics
  const summary = useMemo<DueSummaryStats>(() => {
    return calculateDueSummary(dueRecords);
  }, [dueRecords]);

  // ✅ Step 3: Filter records based on criteria
  const filteredRecords = (filters?: DueFilters): DueRecord[] => {
    if (!filters) return dueRecords;

    return dueRecords.filter((record) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          record.studentName.toLowerCase().includes(query) ||
          record.studentId.toLowerCase().includes(query) ||
          record.studentPhone?.toLowerCase().includes(query) ||
          record.studentEmail?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Days filter
      if (
        filters.minDays !== undefined &&
        record.daysOverdue < filters.minDays
      ) {
        return false;
      }
      if (
        filters.maxDays !== undefined &&
        record.daysOverdue > filters.maxDays
      ) {
        return false;
      }

      // Urgency filter
      if (filters.urgency && filters.urgency.length > 0) {
        if (!filters.urgency.includes(record.urgency)) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    dueRecords,
    summary,
    isLoading,
    refetch,
    filteredRecords,
  };
};
