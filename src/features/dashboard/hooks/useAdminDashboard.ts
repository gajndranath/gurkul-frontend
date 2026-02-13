import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../../../api/adminDashboardApi";

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 10 * 60 * 1000, // 10 min
    refetchOnWindowFocus: true,
  });
};
