import { useQuery, keepPreviousData } from "@tanstack/react-query"; // 1. Import the function
import { fetchAuditLogs } from "../../../api/adminDashboardApi";

// It's a good idea to import your response type to keep things strictly typed
import type { AuditLogsResponse } from "../../../api/adminDashboardApi";

export const useAuditLogs = (
  page: number,
  limit: number,
  search = "",
  action = "all",
) => {
  return useQuery<AuditLogsResponse, Error>({
    queryKey: ["admin-audit-logs", page, limit, search, action],
    queryFn: () => fetchAuditLogs(page, limit, search, action),
    // 2. The v5 way to keep data while fetching new pages
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
};
