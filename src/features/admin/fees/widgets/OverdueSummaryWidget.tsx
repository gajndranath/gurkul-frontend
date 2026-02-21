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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2 bg-white">
      {/* Main Row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Urgency dot */}
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${urg.dot}`} />

        {/* Name + Library ID */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate">
            {student.name}
          </p>
          {student.libraryId && (
            <p className="text-[10px] text-slate-400">#{student.libraryId}</p>
          )}
        </div>

        {/* Days overdue badge */}
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border border-destructive text-destructive bg-destructive/10`}
        >
          {urg.emoji}{" "}
          {student.daysOverdue === 0 ? "Today" : `${student.daysOverdue}d`}
        </span>

        {/* Amount */}
        <span className="text-sm font-bold text-primary">
          {formatCurrency(student.totalDueAmount)}
        </span>

        {/* Expand icon */}
        <span className="text-slate-500">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3 bg-card">
          {/* Months Due */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Months Due
            </p>
            <div className="flex flex-wrap gap-1">
              {student.monthsDue.map((m) => (
                <span
                  key={m}
                  className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded px-2 py-0.5"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Contact + Reminder stats */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            {student.phone && (
              <div className="flex items-center gap-1">
                <Phone size={11} /> {student.phone}
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-1 truncate">
                <Mail size={11} /> {student.email}
              </div>
            )}
            <div className="flex items-center gap-1">
              <BellRing size={11} /> Reminders sent:{" "}
              <strong className="text-blue-600">{student.reminderCount}</strong>
            </div>
            {student.lastReminderSentAt && (
              <div className="flex items-center gap-1">
                <Clock size={11} /> Last:{" "}
                <strong className="text-blue-600">
                  {new Date(student.lastReminderSentAt).toLocaleDateString(
                    "en-IN",
                  )}
                </strong>
              </div>
            )}
            {student.nextReminderDue && (
              <div className="flex items-center gap-1">
                <Bell size={11} /> Next:{" "}
                <strong className="text-blue-600">
                  {new Date(student.nextReminderDue).toLocaleDateString(
                    "en-IN",
                  )}
                </strong>
              </div>
            )}
          </div>

          {/* Send Reminder button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10 text-xs font-black"
            disabled={sending}
            onClick={(e) => {
              e.stopPropagation();
              sendReminder();
            }}
          >
            {sending ? (
              <RefreshCw size={12} className="mr-2 animate-spin" />
            ) : (
              <Bell size={12} className="mr-2" />
            )}
            {sending ? "Sending…" : "Send Reminder Now"}
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
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-black text-secondary flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-400" />
            Overdue Fees
            {(totals?.totalStudentsOverdue ?? 0) > 0 && (
              <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2 py-0.5">
                {totals!.totalStudentsOverdue} student
                {totals!.totalStudentsOverdue > 1 ? "s" : ""}
              </span>
            )}
            {/* Bulk actions */}
            {filtered.length > 0 && (
              <div className="flex gap-2 ml-4">
                <Button
                  size="xs"
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                  disabled={bulkSending || selected.length === 0}
                  onClick={sendBulkReminders}
                >
                  {bulkSending ? (
                    <RefreshCw size={12} className="mr-2 animate-spin" />
                  ) : (
                    <BellRing size={12} className="mr-2" />
                  )}
                  {bulkSending
                    ? "Sending…"
                    : `Send Bulk Reminder (${selected.length})`}
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                  disabled={exporting}
                  onClick={exportCSV}
                >
                  {exporting ? (
                    <RefreshCw size={12} className="mr-2 animate-spin" />
                  ) : (
                    <Bell size={12} className="mr-2" />
                  )}
                  {exporting ? "Exporting…" : "Export CSV"}
                </Button>
              </div>
            )}
          </CardTitle>
          <button
            onClick={() => refetch()}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Summary chips */}
        {totals && totals.totalStudentsOverdue > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <IndianRupee size={12} />
              Total Outstanding:{" "}
              <strong className="text-primary ml-1">
                {formatCurrency(totals.totalOutstandingAmount)}
              </strong>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <StatChip
                label="⛔ 30d+"
                value={totals.critical}
                color="border-destructive text-destructive bg-destructive/10"
              />
              <StatChip
                label="🔴 15d+"
                value={totals.red}
                color="border-destructive text-destructive bg-destructive/10"
              />
              <StatChip
                label="🟠 7d+"
                value={totals.orange}
                color="border-accent text-accent bg-accent/10"
              />
              <StatChip
                label="🟡 3d+"
                value={totals.yellow}
                color="border-yellow-400 text-yellow-600 bg-yellow-100"
              />
              <StatChip
                label="🟢 new"
                value={totals.mild}
                color="border-emerald-400 text-emerald-600 bg-emerald-100"
              />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {students.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            {(["all", "critical", "red", "orange", "yellow"] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize ${
                    filter === f
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? `All (${students.length})` : f}
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
