// frontend/src/features/admin/fees/hooks/useFeeDashboard.ts
import { useQuery } from "@tanstack/react-query";
import * as feeApi from "../api/feeApi";
import { useMonth, useYear } from "@/stores/feeFiltersStore";

export const useFeeDashboard = () => {
  const month = useMonth();
  const year = useYear();

  return useQuery({
    queryKey: ["fees", "dashboard", month, year],
    queryFn: () => feeApi.getDashboardPaymentStatus(month, year),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
