// frontend/src/features/admin/fees/widgets/OverdueSummaryWidget.tsx
// Admin panel: shows all students with outstanding dues, sorted worst-first.
// Each row has a live daysOverdue badge and a "Send Reminder" action.

import React, { useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Clock,
  RefreshCw,
  Users,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
} from "lucide-react";
import { useOverdueSummary } from "../hooks/useFees";
import { formatCurrency } from "@/lib/utils";
// ...existing code...
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import axiosInstance from "@/api/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import type { OverdueStudent } from "../api/feeApi";

// ─── Urgency Config ──────────────────────────────────────────────────────────

const URGENCY_CONFIG = {
  green: {
    label: "New",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
    emoji: "🟢",
  },
  mild: {
    label: "1-3d",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
    emoji: "🟡",
  },
  yellow: {
    label: "3-7d",
    color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
    emoji: "🟠",
  },
  orange: {
    label: "7-15d",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    dot: "bg-red-400",
    emoji: "🔴",
  },
  red: {
    label: "15-30d",
    color: "bg-red-700/30 text-red-300 border-red-600/40",
    dot: "bg-red-500",
    emoji: "🔴",
  },
  critical: {
    label: "30d+",
    color: "bg-rose-900/40 text-rose-200 border-rose-700/50",
    dot: "bg-rose-400 animate-pulse",
    emoji: "⛔",
  },
} as const;

// ─── Student Row ─────────────────────────────────────────────────────────────

function StudentRow({
  student,
  onReminderSent,
}: {
  student: OverdueStudent;
  onReminderSent: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const urg = URGENCY_CONFIG[student.urgency];

  const sendReminder = async () => {
    setSending(true);
    try {
      await axiosInstance.post(`/reminders/send-due-reminder`, {
        dueRecordId: student.dueRecordId,
        studentId: student.studentId,
      });
      toast.success("Reminder sent", `Notified ${student.name}`);
      onReminderSent();
    } catch {
      toast.error("Failed", "Could not send reminder");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="group border-b border-slate-50 last:border-none py-1 first:pt-0">
      {/* Main Row */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 cursor-pointer hover:bg-slate-50/50 rounded-xl sm:rounded-2xl transition-all"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Urgency indicator */}
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urg.dot} shadow-[0_0_8px] shadow-current`} />

          {/* Name + Library ID */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                {student.name}
              </p>
              <Badge 
                variant="outline" 
                className="hidden xs:flex rounded-md text-[8px] font-black border-slate-200 text-slate-400 uppercase h-4 px-1"
              >
                Since {student.monthsDue[0]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {student.libraryId && (
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ID: {student.libraryId}
                </p>
              )}
              <span className="xs:hidden text-[8px] font-bold text-rose-500 uppercase tracking-tighter bg-rose-50 px-1 rounded-sm">
                Since {student.monthsDue[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 pl-4 sm:pl-0">
          {/* Status indicator */}
          <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border flex items-center gap-1.5 ${urg.color}`}>
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{urg.label}</span>
          </div>

          {/* Amount */}
          <div className="text-right flex flex-col items-end">
            <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              {formatCurrency(student.totalDueAmount)}
            </p>
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              {student.daysOverdue === 0 ? "Due Today" : `${student.daysOverdue}d Overdue`}
            </p>
          </div>

          {/* Action Toggle */}
          <span className="text-slate-300 group-hover:text-slate-900 transition-colors shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-12 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Months Due */}
          <div className="flex items-center gap-4">
             <div className="h-0.5 w-4 bg-slate-100" />
              <div className="flex flex-wrap gap-2">
                {student.monthsDue.map((m) => (
                  <span
                    key={m}
                    className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 rounded-md px-2 py-1"
                  >
                    {m}
                  </span>
                ))}
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
            {student.phone && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Phone size={10} className="text-blue-500" /></div> {student.phone}
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Mail size={10} className="text-blue-500" /></div> {student.email}
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><BellRing size={10} className="text-amber-500" /></div> Reminders: <span className="text-slate-900">{student.reminderCount}</span>
            </div>
            {student.lastReminderSentAt && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Clock size={10} className="text-slate-400" /></div> Last: <span className="text-slate-900">{new Date(student.lastReminderSentAt).toLocaleDateString("en-IN")}</span>
              </div>
            )}
          </div>

          {/* Send Reminder button */}
          <Button
            size="sm"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
            disabled={sending}
            onClick={(e) => {
              e.stopPropagation();
              sendReminder();
            }}
          >
            {sending ? (
              <RefreshCw size={14} className="mr-2 animate-spin" />
            ) : (
              <Bell size={14} className="mr-2 text-amber-400" />
            )}
            {sending ? "Processing..." : "Dispatch Reminder Now"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Summary Stat Chip ───────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`flex flex-col items-center px-3 py-1.5 rounded-lg border ${color} min-w-[56px]`}
    >
      <span className="text-lg font-black leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-widest mt-0.5 opacity-70">
        {label}
      </span>
    </div>
  );
}

// ─── Main Widget ─────────────────────────────────────────────────────────────

const OverdueSummaryWidget: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = useOverdueSummary();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<
    "all" | "critical" | "red" | "orange" | "yellow"
  >("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const students = data?.students ?? [];
  const totals = data?.totals;

  const filtered =
    filter === "all"
      ? students
      : students.filter((s) =>
          filter === "critical"
            ? s.urgency === "critical"
            : filter === "red"
              ? s.urgency === "red" || s.urgency === "critical"
              : filter === "orange"
                ? s.urgency === "orange" ||
                  s.urgency === "red" ||
                  s.urgency === "critical"
                : s.urgency === "yellow",
        );

  const handleReminderSent = () => {
    queryClient.invalidateQueries({ queryKey: ["fees", "overdue-summary"] });
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? filtered.map((s) => s.dueRecordId) : []);
  };

  const sendBulkReminders = async () => {
    setBulkSending(true);
    try {
      await axiosInstance.post("/fees/send-bulk-overdue-reminders", {
        dueRecordIds: selected,
      });
      toast.success(
        "Bulk reminders sent",
        `Notified ${selected.length} students`,
      );
      setSelected([]);
      handleReminderSent();
    } catch {
      toast.error("Failed", "Could not send bulk reminders");
    } finally {
      setBulkSending(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await axiosInstance.get("/fees/export-overdue-summary-csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "overdue_summary.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Exported CSV", "File downloaded");
    } catch {
      toast.error("Failed", "Could not export CSV");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <CardHeader className="p-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-20 rounded-xl" />)}
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[24px]" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-[32px] overflow-hidden">
      <CardHeader className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
            <AlertTriangle size={20} className="text-rose-500 shrink-0" />
            <span className="truncate">Arrears Tracker</span>
            {(totals?.totalStudentsOverdue ?? 0) > 0 && (
              <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-3 py-1 font-black ml-2 tracking-widest shadow-sm whitespace-nowrap">
                {totals!.totalStudentsOverdue} AT RISK
              </span>
            )}
          </CardTitle>
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
            {/* Bulk actions */}
            {filtered.length > 0 && (
              <div className="flex gap-2 flex-1 sm:flex-initial">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-initial rounded-xl border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-9 sm:h-10 shadow-sm transition-all"
                  disabled={bulkSending || selected.length === 0}
                  onClick={sendBulkReminders}
                >
                  {bulkSending ? (
                    <RefreshCw size={12} className="mr-1.5 sm:mr-2 animate-spin" />
                  ) : (
                    <BellRing size={12} className="mr-1.5 sm:mr-2" />
                  )}
                  {bulkSending
                    ? "Sending…"
                    : `Remind (${selected.length})`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-initial rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-9 sm:h-10 shadow-sm transition-all whitespace-nowrap"
                  disabled={exporting}
                  onClick={exportCSV}
                >
                  {exporting ? (
                    <RefreshCw size={12} className="mr-1.5 sm:mr-2 animate-spin" />
                  ) : (
                    <IndianRupee size={12} className="mr-1.5 sm:mr-2" /> // Changed icon for context
                  )}
                  {exporting ? "Expt…" : "Export"}
                </Button>
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="text-slate-300 hover:text-blue-600 transition-colors p-2 bg-slate-50 rounded-xl border border-slate-100 h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center shrink-0"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Summary chips */}
        {totals && totals.totalStudentsOverdue > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
              <div className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                 <IndianRupee size={16} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Total Liquidity Risk</p>
                 <p className="text-xl font-black text-rose-600 tracking-tight italic">
                   {formatCurrency(totals.totalOutstandingAmount)}
                 </p>
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <StatChip
                label="Critical"
                value={totals.critical}
                color="border-rose-100 text-rose-600 bg-rose-50 shadow-sm"
              />
              <StatChip
                label="High Risk"
                value={totals.red}
                color="border-rose-100 text-rose-500 bg-rose-50/50"
              />
              <StatChip
                label="Arrears"
                value={totals.orange}
                color="border-amber-100 text-amber-600 bg-amber-50 shadow-sm"
              />
              <StatChip
                label="Pending"
                value={totals.yellow}
                color="border-amber-100 text-amber-500 bg-amber-50/50"
              />
              <StatChip
                label="Recent"
                value={totals.mild}
                color="border-emerald-100 text-emerald-600 bg-emerald-50"
              />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {students.length > 0 && (
          <div className="flex gap-2 flex-wrap border-t border-slate-50 pt-6">
            {(["all", "critical", "red", "orange", "yellow"] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[9px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {f === "all" ? `Consolidated (${students.length})` : f}
                </button>
              ),
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {students.length === 0
                ? "No overdue fees 🎉"
                : "No students in this filter"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={
                  selected.length === filtered.length && filtered.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-xs text-slate-400">Select All</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto pr-1 space-y-0.5 custom-scroll">
              {filtered.map((student) => (
                <div key={student.dueRecordId} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selected.includes(student.dueRecordId)}
                    onChange={(e) =>
                      handleSelect(student.dueRecordId, e.target.checked)
                    }
                    className="mt-4 mr-2 accent-blue-500"
                  />
                  <StudentRow
                    student={student}
                    onReminderSent={handleReminderSent}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OverdueSummaryWidget;
