// frontend/src/features/admin/fees/lib/dueCalculations.ts

import type { UrgencyLevel } from "../types/fee.types";

/**
 * Calculate days between due date and today
 * Due date = last day of the month
 */
export const calculateDaysOverdue = (month: number, year: number): number => {
  const dueDate = new Date(year, month + 1, 0); // Last day of month
  const today = new Date();

  // Reset time part for accurate day calculation
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays); // Negative = not overdue yet
};

/**
 * Get urgency level based on days overdue
 */
export const getUrgencyLevel = (daysOverdue: number): UrgencyLevel => {
  if (daysOverdue > 30) return "critical";
  if (daysOverdue > 15) return "high";
  if (daysOverdue > 7) return "medium";
  if (daysOverdue > 0) return "low";
  return "low"; // Default for 0 days
};

/**
 * Get color classes for urgency badge
 */
export const getUrgencyConfig = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case "critical":
      return {
        color: "bg-rose-100 text-rose-700 border-rose-200",
        label: "CRITICAL",
        icon: "🚨",
      };
    case "high":
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        label: "HIGH",
        icon: "⚠️",
      };
    case "medium":
      return {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        label: "MEDIUM",
        icon: "⚡",
      };
    case "low":
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        label: "LOW",
        icon: "•",
      };
    default:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        label: "LOW",
        icon: "•",
      };
  }
};

/**
 * Format due date display
 */
export const formatDueDate = (month: number, year: number): string => {
  const date = new Date(year, month + 1, 0);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Group due records by urgency
 */
export const groupByUrgency = (records: Array<{ urgency: UrgencyLevel }>) => {
  return records.reduce(
    (acc, record) => {
      acc[record.urgency] = (acc[record.urgency] || 0) + 1;
      return acc;
    },
    {} as Record<UrgencyLevel, number>,
  );
};

/**
 * Calculate summary statistics from due records
 */
export const calculateDueSummary = (
  records: Array<{
    totalAmount: number;
    daysOverdue: number;
    urgency: UrgencyLevel;
  }>,
) => {
  if (records.length === 0) {
    return {
      totalDueAmount: 0,
      totalDueStudents: 0,
      averageOverdueDays: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    };
  }

  const totalDueAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalDays = records.reduce((sum, r) => sum + r.daysOverdue, 0);
  const averageOverdueDays = Math.round(totalDays / records.length);

  const criticalCount = records.filter((r) => r.urgency === "critical").length;
  const highCount = records.filter((r) => r.urgency === "high").length;
  const mediumCount = records.filter((r) => r.urgency === "medium").length;
  const lowCount = records.filter((r) => r.urgency === "low").length;

  return {
    totalDueAmount,
    totalDueStudents: records.length,
    averageOverdueDays,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };
};
