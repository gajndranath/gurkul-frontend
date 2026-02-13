import { useQuery } from "@tanstack/react-query";
import { fetchEndOfMonthDueSummary } from "../../../api/adminDashboardApi";

export const useDueSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: ["admin-due-summary", month, year],
    queryFn: () => fetchEndOfMonthDueSummary(month, year),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
};
