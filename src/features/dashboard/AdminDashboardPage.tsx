import React, { useState, useMemo, useCallback, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  fetchDashboardStats,
  fetchAuditLogs,
  fetchEndOfMonthDueSummary,
} from "../../api/adminDashboardApi";
import {} from "../../api/adminDashboardApi";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/utils";
import MonthlyTrendChart from "./widgets/MonthlyTrendChart";
const SlotOccupancyTable = React.lazy(
  () => import("./widgets/SlotOccupancyTable"),
);
const AuditLogTable = React.lazy(() => import("./widgets/AuditLogTable"));
const DueSummaryTable = React.lazy(() => import("./widgets/DueSummaryTable"));
const PaymentStatusPie = React.lazy(() => import("./widgets/PaymentStatusPie"));
const TopSlots = React.lazy(() => import("./widgets/TopSlots"));

import QuickStats from "./widgets/QuickStats";
import SlotOccupancyBar from "./widgets/SlotOccupancyBar";
const ReminderWidget = lazy(() => import("./widgets/ReminderWidget"));

const CHART_COLORS = {
  primary: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PAGE_SIZE = 20;

const AdminDashboardPage: React.FC = () => {
  // Debug: print when component mounts and on data change

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [auditPage, setAuditPage] = useState(1);
  const [duePage, setDuePage] = useState(1);

  // Fetch dashboard stats
  const {
    data: dashboardData,
    refetch,
    isError: isDashboardError,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch audit logs
  const {
    data: auditData,
    isLoading: auditLoading,
    isError: isAuditError,
    error: auditError,
  } = useQuery({
    queryKey: ["audit-logs", auditPage],
    queryFn: () => fetchAuditLogs(auditPage, PAGE_SIZE),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch due summary
  const {
    data: dueSummary,
    isLoading: dueLoading,
    isError: isDueError,
    error: dueError,
  } = useQuery({
    queryKey: ["due-summary", selectedMonth, selectedYear],
    queryFn: () => fetchEndOfMonthDueSummary(selectedMonth, selectedYear),
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
  const auditLogs = auditData?.logs || [];
  const auditTotalPages = auditData?.pagination?.pages || 1;
  // useCallback for stable reference (passed to child component)
  const handleAuditPageChange = useCallback((p: number) => setAuditPage(p), []);

  // Due summary pagination
  // Memoize dueStudents to satisfy exhaustive-deps and avoid unnecessary recalculation
  const dueStudents = useMemo(() => dueSummary?.students || [], [dueSummary]);
  const dueTotal = dueStudents.length;
  const duePageSize = PAGE_SIZE;
  const pagedDueStudents = useMemo(
    () => dueStudents.slice((duePage - 1) * duePageSize, duePage * duePageSize),
    [dueStudents, duePage, duePageSize],
  );
  // useCallback for stable reference (passed to child component)
  const handleDuePageChange = useCallback((p: number) => setDuePage(p), []);

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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back. Here’s your library’s latest stats.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-sm">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(Number(e.target.value));
              setDuePage(1);
            }}
            className="border rounded px-3 py-2 text-base focus:ring focus:border-primary"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setDuePage(1);
            }}
            className="border rounded px-3 py-2 w-24 text-base focus:ring focus:border-primary"
            min={2020}
            max={new Date().getFullYear() + 1}
          />
          <Button onClick={() => refetch()} className="ml-2">
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+8% from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Stats & System Health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
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
                  advanceBalance:
                    dashboardData.overview.advance.remainingAdvance,
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Service status and uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Email Service</span>
                </div>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Push Notifications</span>
                </div>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Cron Jobs</span>
                </div>
                <Badge variant="default">Running</Badge>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Last Updated
                </div>
                <div className="text-sm font-medium">
                  {dashboardData?.generatedAt
                    ? dashboardData.generatedAt
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Fee Collection Trend</CardTitle>
            <CardDescription>
              Payment collection performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart
              monthlyTrend={
                Array.isArray(dashboardData?.monthlyTrend)
                  ? dashboardData?.monthlyTrend
                  : dashboardData?.monthlyTrend
                    ? [dashboardData?.monthlyTrend]
                    : []
              }
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8">
          {dashboardData?.currentMonth && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>
                  Current month fee collection breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentStatusPie
                  paymentStatus={[
                    {
                      name: "Paid",
                      value: dashboardData.currentMonth.paidAmount,
                      color: "#10b981",
                    },
                    {
                      name: "Due",
                      value: dashboardData.currentMonth.dueAmount,
                      color: "#f59e0b",
                    },
                    {
                      name: "Pending",
                      value: dashboardData.currentMonth.pendingAmount,
                      color: "#ef4444",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {dashboardData?.overview?.slotsWithOccupancy && (
            <Card>
              <CardHeader>
                <CardTitle>Slot Occupancy</CardTitle>
                <CardDescription>
                  Current seat occupancy across all slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SlotOccupancyBar
                  slots={dashboardData.overview.slotsWithOccupancy.map(
                    (slot) => ({
                      name: slot.name,
                      occupied: slot.occupiedSeats,
                      available: slot.availableSeats,
                      occupancy: slot.occupancyPercentage,
                    }),
                  )}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Slot Occupancy Table</CardTitle>
              <CardDescription>
                Detailed slot occupancy breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto p-0 sm:p-6">
                <div className="min-w-[320px]">
                  <Suspense
                    fallback={<div>Loading slot occupancy table...</div>}
                  >
                    <SlotOccupancyTable
                      slots={dashboardData?.overview?.slotsWithOccupancy || []}
                    />
                  </Suspense>
                </div>
              </div>
            </CardContent>
          </Card>

          {dashboardData?.overview?.slotsWithOccupancy && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Slots</CardTitle>
                <CardDescription>Highest occupancy rate slots</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading top slots...</div>}>
                  <TopSlots
                    topSlots={dashboardData.overview.slotsWithOccupancy
                      .sort(
                        (a, b) => b.occupancyPercentage - a.occupancyPercentage,
                      )
                      .slice(0, 5)
                      .map((slot) => ({
                        _id: slot._id,
                        name: slot.name,
                        timeRange: { start: "08:00", end: "20:00" },
                        occupancyPercentage: slot.occupancyPercentage,
                        occupiedSeats: slot.occupiedSeats,
                        totalSeats: slot.totalSeats,
                      }))}
                  />
                </Suspense>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reminders (lazy loaded) */}
      <Suspense fallback={<div>Loading reminders...</div>}>
        <React.Suspense fallback={<div>Loading reminders...</div>}>
          <ReminderWidget />
        </React.Suspense>
      </Suspense>

      {/* Audit Logs & Due Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Recent system activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto p-0 sm:p-6">
              <div className="min-w-[320px]">
                <Suspense fallback={<div>Loading audit logs...</div>}>
                  <AuditLogTable
                    logs={auditLogs.map((log) => ({
                      _id: log.id || "",
                      action: log.action,
                      user: log.admin || "",
                      timestamp: log.timestamp,
                      details: log.targetEntity
                        ? `${log.action} ${log.targetEntity}`
                        : undefined,
                    }))}
                    page={auditPage}
                    totalPages={auditTotalPages}
                    onPageChange={handleAuditPageChange}
                    isLoading={auditLoading}
                  />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>End-of-Month Due Summary</CardTitle>
            <CardDescription>Students with outstanding fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto p-0 sm:p-6">
              <div className="min-w-[320px]">
                <Suspense fallback={<div>Loading due summary...</div>}>
                  <DueSummaryTable
                    students={pagedDueStudents.map((student) => ({
                      _id: student._id,
                      name: student.studentId?.name || "",
                      dueAmount: student.totalAmount,
                      dueMonth: `${selectedMonth + 1}/${selectedYear}`,
                      status: student.status,
                    }))}
                    total={dueTotal}
                    page={duePage}
                    pageSize={duePageSize}
                    onPageChange={handleDuePageChange}
                    isLoading={dueLoading}
                  />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center mt-8">
        <Card className="p-6">
          <div className="text-3xl font-bold text-primary mb-1">
            {dashboardData?.overview.totalSlots || 0}
          </div>
          <div className="text-base text-muted-foreground">Total Slots</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {dashboardData?.overview.activeStudents || 0}
          </div>
          <div className="text-base text-muted-foreground">Active Students</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {dashboardData?.overview.slotsWithOccupancy?.reduce(
              (acc, slot) => acc + slot.occupiedSeats,
              0,
            ) || 0}
          </div>
          <div className="text-base text-muted-foreground">
            Total Occupied Seats
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {dashboardData?.overview.slotsWithOccupancy?.reduce(
              (acc, slot) => acc + slot.availableSeats,
              0,
            ) || 0}
          </div>
          <div className="text-base text-muted-foreground">
            Total Available Seats
          </div>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(AdminDashboardPage);
