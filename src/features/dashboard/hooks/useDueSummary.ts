import { useQuery, keepPreviousData } from "@tanstack/react-query"; // 1. Import the function
import { fetchEndOfMonthDueSummary } from "../../../api/adminDashboardApi";

// Define an interface for your response if you haven't already
export interface DueSummaryResponse {
  totalDues: number;
  // ... other fields
}

export const useDueSummary = (month: number, year: number) => {
  return useQuery<DueSummaryResponse, Error>({
    queryKey: ["admin-due-summary", month, year],
    queryFn: () => fetchEndOfMonthDueSummary(month, year),
    // 2. Change keepPreviousData: true to placeholderData: keepPreviousData
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
};
