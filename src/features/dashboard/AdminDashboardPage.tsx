import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, DollarSign, CreditCard, AlertCircle, Zap, ShieldCheck, Search, Activity, Target } from "lucide-react";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchDashboardStats,
  fetchAuditLogs,
  fetchEndOfMonthDueSummary,
} from "../../api/adminDashboardApi";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/utils";

import ExceptionFeedWidget from "./widgets/ExceptionFeedWidget";
import OccupancyRadarWidget from "./widgets/OccupancyRadarWidget";
import MonthlyTrendChart from "./widgets/MonthlyTrendChart";
import AuditLogTable from "./widgets/AuditLogTable";
import DueSummaryTable from "./widgets/DueSummaryTable";
import { Plus, IndianRupee, UserCheck, Settings, ExternalLink } from "lucide-react";

const PAGE_SIZE = 5;

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [auditPage, setAuditPage] = React.useState(1);
  const [duePage, setDuePage] = React.useState(1);

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
  const { 
    data: auditLogs, 
    isError: isAuditError, 
    error: auditError,
    isLoading: isAuditLoading 
  } = useQuery({
    queryKey: ["audit-logs", auditPage],
    queryFn: () => fetchAuditLogs(auditPage, PAGE_SIZE),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch due summary
  const { 
    data: dueSummary,
    isError: isDueError, 
    error: dueError,
    isLoading: isDueLoading
  } = useQuery({
    queryKey: ["due-summary", duePage, new Date().getMonth(), new Date().getFullYear()],
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

  // Memoized KPI cards
  const kpiCards = useMemo(() => {
    const overview = dashboardData?.overview;
    const currentMonth = dashboardData?.currentMonth;
    return [
      {
        title: "Total Members",
        value: overview?.totalStudents || 0,
        icon: Users,
        color: "#2563eb",
        badge: "Active Registry",
        description: "Standard Seats Occupied",
      },
      {
        title: "Monthly Yield",
        value: formatCurrency(currentMonth?.paidAmount || 0),
        icon: DollarSign,
        color: "#059669",
        badge: "Revenue Flow",
        description: "Collection Velocity",
      },
      {
        title: "Expected Intake",
        value: formatCurrency(currentMonth?.pendingAmount || 0),
        icon: CreditCard,
        color: "#d97706",
        badge: "Pending Funds",
        description: "Reserved Capital",
      },
      {
        title: "Risk Exposure",
        value: formatCurrency(overview?.overdue?.totalAmount || 0),
        icon: AlertCircle,
        color: "#e11d48",
        badge: "High Alert",
        description: "Overdue Receivables",
      },
    ];
  }, [dashboardData]);

  // Derive Exceptions from Telemetry
  const derivedExceptions = useMemo(() => {
    const ex: any[] = [];
    if (!dashboardData) return [];

    // 1. Overdue Exceptions
    if (dashboardData.overview.overdue.count > 0) {
      ex.push({
        id: "overdue-summary",
        type: "OVERDUE",
        severity: "critical",
        title: `${dashboardData.overview.overdue.count} Overdue Payments`,
        description: `Total exposure of ${formatCurrency(dashboardData.overview.overdue.totalAmount)} detected across active slots.`,
        timestamp: "REAL-TIME",
        actionPath: "/admin/due"
      });
    }

    // 2. Low Occupancy Exceptions
    dashboardData.overview.slotsWithOccupancy.forEach((slot: any) => {
       if (slot.occupancyPercentage < 40) {
         ex.push({
            id: `low-occ-${slot._id}`,
            type: "LOW_OCCUPANCY",
            severity: "high",
            title: `Low Density: ${slot.name}`,
            description: `Infrastructure at ${Math.round(slot.occupancyPercentage)}% capacity. Consider consolidation.`,
            timestamp: "SYSTEM",
            actionPath: "/admin/slots"
         });
       }
    });

    return ex;
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
    <div className="container mx-auto p-4 md:p-8 space-y-10 bg-[#fafafa]">
      {/* Header Nerve Center */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200">
               <Zap size={18} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
              Operational <span className="text-blue-600">Nerve</span>
            </h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] max-w-xl leading-relaxed">
            Standardizing library telemetry. Analyze occupancy, monitor cash flow velocity, and execute exception management in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Badge className="h-14 px-6 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-3">
             <ShieldCheck size={16} className="text-emerald-500" />
             Registry Locked
          </Badge>
          <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
             <Search size={20} />
          </div>
        </div>
      </div>

      {/* KPI Core Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card: any, idx: number) => (
          <Card key={idx} className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden group hover:ring-2 hover:ring-blue-600/5 transition-all active:scale-[0.98]">
             <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                   <div 
                     className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm"
                     style={{ backgroundColor: `${card.color}10`, color: card.color }}
                   >
                     <card.icon size={22} />
                   </div>
                   <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-full border-slate-100 px-3 py-1">
                      {card.badge}
                   </Badge>
                </div>

                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.title}</p>
                   <div className="text-4xl font-black text-slate-900 tracking-tighter italic">
                      {card.value}
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 italic">
                      <Activity size={12} className="text-blue-500" />
                      {card.description}
                   </p>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Operational Pulse Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Quick Actions Panel */}
           <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Command Center</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rapid Protocol Execution</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Button onClick={() => navigate("/admin/students/add")} className="h-20 rounded-2xl bg-slate-50 border-none text-slate-900 hover:bg-blue-600 hover:text-white flex flex-col gap-2 transition-all">
                    <Plus size={20} />
                    <span className="text-[10px] font-black uppercase">Add Member</span>
                 </Button>
                 <Button onClick={() => navigate("/admin/fees")} className="h-20 rounded-2xl bg-slate-50 border-none text-slate-900 hover:bg-emerald-600 hover:text-white flex flex-col gap-2 transition-all">
                    <IndianRupee size={20} />
                    <span className="text-[10px] font-black uppercase">Manage Fees</span>
                 </Button>
                 <Button onClick={() => navigate("/admin/attendance")} className="h-20 rounded-2xl bg-slate-50 border-none text-slate-900 hover:bg-orange-600 hover:text-white flex flex-col gap-2 transition-all">
                    <UserCheck size={20} />
                    <span className="text-[10px] font-black uppercase">Attendance</span>
                 </Button>
                 <Button onClick={() => navigate("/admin/settings")} className="h-20 rounded-2xl bg-slate-50 border-none text-slate-900 hover:bg-slate-900 hover:text-white flex flex-col gap-2 transition-all">
                    <Settings size={20} />
                    <span className="text-[10px] font-black uppercase">Terminal Config</span>
                 </Button>
              </div>
           </Card>

           {/* Metrics & Analytics */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MonthlyTrendChart monthlyTrend={dashboardData?.monthlyTrend || []} />
              <OccupancyRadarWidget slots={dashboardData?.overview.slotsWithOccupancy || []} />
           </div>

           {/* Live Telemetry: Audit & Registry */}
           <div className="space-y-8">
              <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Security Audit Trail
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/audit")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">
                    Full Log <ExternalLink size={12} className="ml-2" />
                  </Button>
                </div>
                <div className="p-4">
                  <AuditLogTable 
                    logs={auditLogs?.logs.map((log: any) => ({
                      _id: log.id,
                      action: log.action,
                      user: log.admin,
                      timestamp: log.timestamp,
                      details: log.targetEntity
                    })) || []} 
                    page={auditPage} 
                    totalPages={auditLogs?.pagination.pages || 1} 
                    onPageChange={setAuditPage} 
                    isLoading={isAuditLoading} 
                  />
                </div>
              </Card>

              <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                    <AlertCircle size={18} className="text-rose-600" />
                    Registry Exceptions (Due)
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/due")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600">
                    Due Tracking <ExternalLink size={12} className="ml-2" />
                  </Button>
                </div>
                <div className="p-4">
                  <DueSummaryTable 
                    students={dueSummary?.students.map((s: any) => ({
                      _id: s._id,
                      name: s.studentId?.name || "Unknown",
                      dueAmount: s.totalAmount,
                      dueMonth: "Current",
                      status: s.status
                    })) || []} 
                    total={dueSummary?.totalDueStudents || 0} 
                    page={duePage} 
                    pageSize={PAGE_SIZE} 
                    onPageChange={setDuePage} 
                    isLoading={isDueLoading} 
                  />
                </div>
              </Card>
           </div>
        </div>

        <div className="space-y-8">
           {/* Exception Feed */}
           <ExceptionFeedWidget exceptions={derivedExceptions} />

           {/* Quick Stats Summary */}
           <Card className="border-none shadow-sm bg-blue-600 rounded-[32px] overflow-hidden p-8 text-white relative group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                 <Target size={160} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Health Metric</p>
                    <h4 className="text-3xl font-black tracking-tighter uppercase italic">Collection<br/>Efficiency</h4>
                 </div>
                 
                 <div className="text-6xl font-black tracking-tighter italic">
                    {Math.round(
                      ((dashboardData?.currentMonth?.paidAmount || 0) /
                        ((dashboardData?.currentMonth?.paidAmount || 0) +
                          (dashboardData?.currentMonth?.dueAmount || 0) +
                          (dashboardData?.currentMonth?.pendingAmount || 0) || 1)) *
                        100,
                    )}%
                 </div>

                 <p className="text-[11px] font-bold text-blue-100 uppercase tracking-tight leading-relaxed italic opacity-80">
                    Your collection velocity is performing above average for this cycle. Keep optimizing overdue remediations.
                 </p>
              </div>
           </Card>
        </div>
      </div>

      {/* Footer System Insight */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-8 bg-slate-900 rounded-[48px] text-white">
        <div className="flex items-center gap-5">
           <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 leading-none">Security Architecture</p>
              <p className="text-sm font-black uppercase tracking-tight">End-to-End Cryptographic Transaction Layer Active</p>
           </div>
        </div>
        <div className="mt-6 md:mt-0 opacity-40">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Telemetry Version v8.1.0-RC1</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminDashboardPage);
