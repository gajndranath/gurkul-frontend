import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  fetchDashboardStats,
  fetchAuditLogs,
  fetchEndOfMonthDueSummary,
} from "../../api/adminDashboardApi";
import {} from "../../api/adminDashboardApi";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/utils";

import QuickStats from "./widgets/QuickStats";

const CHART_COLORS = {
  primary: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PAGE_SIZE = 20;

const AdminDashboardPage: React.FC = () => {
  // Debug: print when component mounts and on data change

  // ...existing code...

  // Fetch dashboard stats
  const {
    data: dashboardData,
    isError: isDashboardError,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch audit logs
  const { isError: isAuditError, error: auditError } = useQuery({
    queryKey: ["audit-logs", 1],
    queryFn: () => fetchAuditLogs(1, PAGE_SIZE),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch due summary
  const { isError: isDueError, error: dueError } = useQuery({
    queryKey: ["due-summary", new Date().getMonth(), new Date().getFullYear()],
    queryFn: () =>
      fetchEndOfMonthDueSummary(
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    staleTime: 5 * 60 * 1000,
  });

  // Debug hooks must come after dashboardData is declared, but outside of useQuery
  React.useEffect(() => {
    console.log("[AdminDashboardPage] mounted");
    console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
  }, []);
  React.useEffect(() => {
    console.log("dashboardData:", dashboardData);
  }, [dashboardData]);

  // Memoized KPI cards: Only memoize if dashboardData is expensive to compute or changes frequently
  const kpiCards = useMemo(() => {
    const overview = dashboardData?.overview;
    const currentMonth = dashboardData?.currentMonth;
    return [
      {
        title: "Total Students",
        value: overview?.totalStudents || 0,
        icon: Users,
        color: CHART_COLORS.primary,
        description: "Active students",
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(currentMonth?.paidAmount || 0),
        icon: DollarSign,
        color: CHART_COLORS.success,
        description: "Current month collected",
      },
      {
        title: "Pending Fees",
        value: formatCurrency(currentMonth?.pendingAmount || 0),
        icon: CreditCard,
        color: CHART_COLORS.warning,
        description: "Expected this month",
      },
      {
        title: "Overdue Amount",
        value: formatCurrency(overview?.overdue?.totalAmount || 0),
        icon: AlertCircle,
        color: CHART_COLORS.danger,
        description: "Overdue fees",
      },
    ];
  }, [dashboardData]);

  // Audit logs pagination
  // No need to memoize simple property access; use direct assignment for clarity

  // Due summary pagination
  // Memoize dueStudents to satisfy exhaustive-deps and avoid unnecessary recalculation

  // Show toast notifications for errors
  React.useEffect(() => {
    if (isDashboardError) {
      toast.error(
        dashboardError instanceof Error
          ? dashboardError.message
          : "Failed to load dashboard stats.",
      );
    }
  }, [isDashboardError, dashboardError]);

  React.useEffect(() => {
    if (isAuditError) {
      toast.error(
        auditError instanceof Error
          ? auditError.message
          : "Failed to load audit logs.",
      );
    }
  }, [isAuditError, auditError]);

  React.useEffect(() => {
    if (isDueError) {
      toast.error(
        dueError instanceof Error
          ? dueError.message
          : "Failed to load due summary.",
      );
    }
  }, [isDueError, dueError]);

  return (
    <div className="relative min-h-screen bg-background w-full px-2 sm:px-4 md:px-6 py-6 mx-auto flex flex-col gap-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back. Here’s your library’s key stats.
        </p>
      </div>

      {/* Minimal KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <Card key={idx} className="card-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {card.title}
              </CardTitle>
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center bg-opacity-20"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Minimal Quick Stats */}
      <div className="mt-6">
        {dashboardData?.overview && (
          <QuickStats
            stats={{
              collectionRate: Math.round(
                (dashboardData.currentMonth?.paidAmount /
                  (dashboardData.currentMonth?.paidAmount +
                    dashboardData.currentMonth?.dueAmount +
                    dashboardData.currentMonth?.pendingAmount)) *
                  100,
              ),
              advanceBalance: dashboardData.overview.advance.remainingAdvance,
              totalAdvance: dashboardData.overview.advance.totalAdvance,
              avgMonthlyFee:
                dashboardData.currentMonth?.paidAmount /
                (dashboardData.currentMonth?.paid || 1),
              overdueStudents: dashboardData.overview.overdue.count,
              overduePercent: Math.round(
                (dashboardData.overview.overdue.count /
                  dashboardData.overview.activeStudents) *
                  100,
              ),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(AdminDashboardPage);
