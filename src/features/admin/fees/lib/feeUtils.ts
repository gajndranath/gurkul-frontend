import { getMonthName } from "../../../../lib/utils";
import type { FeeStatus } from "../types/fee.types";

/**
 * Formats backend month (0-11) to readable string
 */
export const formatFeeMonth = (month: number, year: number) => {
  return `${getMonthName(month)} ${year}`;
};

/**
 * Calculates the total potential loss if dues are not collected
 */
export const calculateCollectionGap = (total: number, collected: number) => {
  return total - collected;
};

/**
 * Colors for status badges following the "Swiss Design" palette
 */
export const getStatusConfig = (status: string) => {
  switch (status) {
    case "PAID":
      return {
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        label: "Paid",
      };
    case "DUE":
      return {
        color: "bg-rose-50 text-rose-700 border-rose-100",
        label: "Overdue",
      };
    case "NOT_GENERATED":
      return {
        color: "bg-slate-50 text-slate-400 border-slate-100",
        label: "Not Billed",
      };
    default:
      return {
        color: "bg-amber-50 text-amber-700 border-amber-100",
        label: "Pending",
      };
  }
};

/* ============ 🆕 DUE UTILITIES ============ */

/**
 * Filter active due records (status = DUE)
 */
export const filterDueRecords = <T extends { status: FeeStatus }>(
  records: T[],
): T[] => {
  return records.filter((record) => record.status === "DUE");
};

/**
 * Sort due records by days overdue (most urgent first)
 */
export const sortByUrgency = <T extends { daysOverdue: number }>(
  records: T[],
): T[] => {
  return [...records].sort((a, b) => b.daysOverdue - a.daysOverdue);
};

/**
 * Get filter options for due tracking
 */
export const getDaysFilterOptions = () => [
  { value: "all", label: "All Overdue" },
  { value: "7", label: "7+ days" },
  { value: "15", label: "15+ days" },
  { value: "30", label: "30+ days" },
];

/**
 * Check if record matches days filter
 */
export const matchesDaysFilter = (
  daysOverdue: number,
  filterValue: string,
): boolean => {
  if (filterValue === "all") return true;
  const minDays = parseInt(filterValue, 10);
  return daysOverdue >= minDays;
};

/* ========================================== */
