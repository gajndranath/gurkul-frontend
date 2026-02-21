// frontend/src/features/students/StudentFeePage.tsx
// Student-facing fee history page — shows full timeline + calendar.
// Read-only view: same data as admin sees but NO payment actions.

import React, { useMemo } from "react";
import {
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Calendar,
  History,
  ShieldCheck,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { useFeeSummary } from "../admin/fees/hooks/useFees";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import FeeCalendarView from "../admin/fees/widgets/FeeCalendarView";
import type { FeeHistoryItem } from "../admin/fees/types/fee.types";
import { getStatusConfig, formatFeeMonth } from "../admin/fees/lib/feeUtils";
import { useState } from "react";

type ViewTab = "timeline" | "calendar";

const StudentFeePage: React.FC = () => {
  const { student } = useSessionStore();
  const studentId = (student as any)?._id || (student as any)?.id;
  const { data, isLoading } = useFeeSummary(studentId);
  const [view, setView] = useState<ViewTab>("timeline");

  const feeHistory = useMemo(() => data?.feeHistory || [], [data]);
  const advance = data?.advance;
  const currentDue = data?.currentDue;
  const totals = (data as any)?.totals;

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold">
        Unable to load fee data. Please log in again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
            <Wallet size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Fee History
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
          My Fees
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Complete payment history, dues, and calendar view.
        </p>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            label="Total Paid"
            value={formatCurrency(totals?.totalPaid || 0)}
            bg="bg-emerald-50"
            text="text-emerald-700"
            border="border-emerald-100"
          />
          <SummaryCard
            icon={<AlertCircle size={18} className="text-rose-600" />}
            label="Total Due"
            value={formatCurrency(currentDue?.totalDueAmount || 0)}
            bg="bg-rose-50"
            text="text-rose-700"
            border="border-rose-100"
            sub={
              currentDue?.monthsDue?.length
                ? `${currentDue.monthsDue.length} month${currentDue.monthsDue.length > 1 ? "s" : ""} overdue`
                : undefined
            }
          />
          <SummaryCard
            icon={<Clock size={18} className="text-amber-600" />}
            label="Pending"
            value={formatCurrency(totals?.totalPending || 0)}
            bg="bg-amber-50"
            text="text-amber-700"
            border="border-amber-100"
          />
          <SummaryCard
            icon={<Wallet size={18} className="text-blue-600" />}
            label="Advance Balance"
            value={formatCurrency(advance?.remainingAmount || 0)}
            bg="bg-blue-50"
            text="text-blue-700"
            border="border-blue-100"
          />
        </div>
      )}

      {/* ── Outstanding Due Banner ───────────────────────────────── */}
      {currentDue && currentDue.totalDueAmount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="font-black text-rose-700 text-sm">
              You have ₹{currentDue.totalDueAmount.toLocaleString("en-IN")} outstanding
            </p>
            <p className="text-rose-500 text-xs font-medium mt-0.5">
              Months: {currentDue.monthsDue?.join(", ")}
              {currentDue.reminderDate && (
                <> · Reminder: {new Date(currentDue.reminderDate).toLocaleDateString("en-IN")}</>
              )}
            </p>
            <p className="text-rose-400 text-xs mt-1 font-medium">
              Please contact the library desk to clear your dues.
            </p>
          </div>
        </div>
      )}

      {/* ── View Toggle ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <TabButton active={view === "timeline"} onClick={() => setView("timeline")} icon={<History size={14} />}>
          Timeline
        </TabButton>
        <TabButton active={view === "calendar"} onClick={() => setView("calendar")} icon={<Calendar size={14} />}>
          Calendar
        </TabButton>
      </div>

      {/* ── Timeline View ────────────────────────────────────────── */}
      {view === "timeline" && (
        <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[32px] overflow-hidden bg-white">
          <div className="p-5 border-b border-slate-50 flex items-center gap-2">
            <History size={16} className="text-blue-600" />
            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">
              Payment Timeline
            </h2>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : feeHistory.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-bold text-sm">
                No fee records yet.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        {["Month", "Base Fee", "Arrears", "Total", "Paid", "Balance", "Status", "Paid On"].map((h) => (
                          <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {feeHistory.map((item: FeeHistoryItem) => {
                        const cfg = getStatusConfig(item.status);
                        return (
                          <tr key={`${item.year}-${item.month}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900 text-sm whitespace-nowrap">
                                {formatFeeMonth(item.month, item.year)}
                              </p>
                              {item.locked && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                                  <ShieldCheck size={9} /> Cleared
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">
                              {formatCurrency(item.baseFee)}
                            </td>
                            <td className="px-5 py-4">
                              {item.dueCarriedForward > 0 ? (
                                <span className="text-sm font-bold text-rose-500">
                                  +{formatCurrency(item.dueCarriedForward)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm font-black text-slate-900">
                              {formatCurrency(item.totalAmount)}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-emerald-700">
                              {formatCurrency(item.paidAmount)}
                            </td>
                            <td className="px-5 py-4">
                              {item.remainingAmount > 0 ? (
                                <div>
                                  <span className="text-sm font-bold text-rose-600">
                                    {formatCurrency(item.remainingAmount)}
                                  </span>
                                  {item.daysOverdue > 0 && (
                                    <p className="text-[8px] font-black text-rose-400 uppercase flex items-center gap-0.5 mt-0.5">
                                      <TrendingDown size={8} />{item.daysOverdue}d late
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <Badge className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase ${cfg.color}`}>
                                {cfg.label}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                              {item.paymentDate
                                ? new Date(item.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                                : <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {feeHistory.map((item: FeeHistoryItem) => {
                    const cfg = getStatusConfig(item.status);
                    return (
                      <div key={`${item.year}-${item.month}`} className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-slate-900">{formatFeeMonth(item.month, item.year)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`rounded-md text-[8px] font-black uppercase ${cfg.color}`}>
                                {cfg.label}
                              </Badge>
                              {item.daysOverdue > 0 && (
                                <span className="text-[8px] font-black text-rose-400 uppercase flex items-center gap-0.5">
                                  <TrendingDown size={8} />{item.daysOverdue}d late
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">{formatCurrency(item.paidAmount)}</p>
                            <p className="text-[9px] text-slate-400 font-bold">of {formatCurrency(item.totalAmount)}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 text-[10px] font-bold text-slate-500 grid grid-cols-2 gap-2">
                          <span>Base: {formatCurrency(item.baseFee)}</span>
                          {item.dueCarriedForward > 0 && (
                            <span className="text-rose-500">Arrears: +{formatCurrency(item.dueCarriedForward)}</span>
                          )}
                          {item.remainingAmount > 0 && (
                            <span className="text-rose-600">Balance: {formatCurrency(item.remainingAmount)}</span>
                          )}
                          {item.paymentDate && (
                            <span>Paid: {new Date(item.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Calendar View ─────────────────────────────────────────── */}
      {view === "calendar" && (
        <FeeCalendarView studentId={studentId} readOnly />
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  text: string;
  border: string;
  sub?: string;
}> = ({ icon, label, value, bg, text, border, sub }) => (
  <Card className={`border-none ring-1 ${border} shadow-sm rounded-3xl ${bg}`}>
    <CardContent className="p-4">
      <div className="p-2 bg-white/70 rounded-xl w-fit mb-3">{icon}</div>
      <p className={`text-xl font-black leading-tight ${text}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
      {sub && <p className={`text-[9px] font-bold mt-0.5 ${text} opacity-70`}>{sub}</p>}
    </CardContent>
  </Card>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
    }`}
  >
    {icon}
    {children}
  </button>
);

export default StudentFeePage;
