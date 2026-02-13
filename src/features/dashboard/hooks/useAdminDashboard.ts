import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  type DashboardStatsResponse,
} from "../../../api/adminDashboardApi";

export const useAdminDashboard = () => {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min (Renamed from cacheTime)
    refetchOnWindowFocus: true,
  });
};
