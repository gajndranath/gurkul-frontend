import axiosInstance from "./axiosInstance";
// --- Types ---

export interface DashboardOverview {
  totalStudents: number;
  activeStudents: number;
  archivedStudents: number;
  totalSlots: number;
  slotsWithOccupancy: Array<{
    _id: string;
    name: string;
    totalSeats: number;
    occupiedSeats: number;
    availableSeats: number;
    occupancyPercentage: number;
  }>;
  advance: {
    totalAdvance: number;
    remainingAdvance: number;
    utilizedAdvance: number;
  };
  overdue: { count: number; totalAmount: number };
}
export interface DashboardCurrentMonth {
  month: number;
  year: number;
  paid: number;
  due: number;
  pending: number;
  paidAmount: number;
  dueAmount: number;
  pendingAmount: number;
}
export interface DashboardMonthlyTrend {
  month: string;
  paid: number;
  due: number;
  paidAmount: number;
  dueAmount: number;
}
// --- API ---
// Reminders
export const fetchReminders = async () => {
  const { data } = await axiosInstance.get("/admin/reminders");
  return data.data;
};
export interface DashboardStatsResponse {
  overview: DashboardOverview;
  currentMonth: DashboardCurrentMonth;
  monthlyTrend: DashboardMonthlyTrend[];
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  admin: string;
  action: string;
  targetEntity: string;
  targetId: string;
  changes: { old: unknown; new: unknown };
  timestamp: string;
}
export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface DueStudent {
  _id: string;
  studentId: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    monthlyFee: number;
  };
  totalAmount: number;
  status: string;
}
export interface DueSummaryResponse {
  month: number;
  year: number;
  totalDueStudents: number;
  students: DueStudent[];
  totalDueAmount: number;
}

// Dashboard stats
export const fetchDashboardStats =
  async (): Promise<DashboardStatsResponse> => {
    const { data } = await axiosInstance.get("/admin/dashboard-stats");
    return data.data;
  };

// Audit logs with pagination
export const fetchAuditLogs = async (
  page = 1,
  limit = 20,
  search = "",
  action = "all",
): Promise<AuditLogsResponse> => {
  interface AuditLogParams {
    page: number;
    limit: number;
    search?: string;
    action?: string;
  }
  const params: AuditLogParams = { page, limit };
  if (search) params.search = search;
  if (action && action !== "all") params.action = action;
  const { data } = await axiosInstance.get("/admin/audit-logs", { params });
  return data.data;
};

// End-of-month due summary
export const fetchEndOfMonthDueSummary = async (
  month: number,
  year: number,
): Promise<DueSummaryResponse> => {
  const { data } = await axiosInstance.get("/reminders/due-summary", {
    params: { month, year },
  });
  return data.data;
};
