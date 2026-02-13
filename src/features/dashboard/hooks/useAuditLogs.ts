import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAuditLogs } from "../../../api/adminDashboardApi";

export const useAuditLogs = (
  page: number,
  limit: number,
  search = "",
  action = "all",
) => {
  return useQuery({
    queryKey: ["admin-audit-logs", page, limit, search, action],
    queryFn: () => fetchAuditLogs(page, limit, search, action),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
};
