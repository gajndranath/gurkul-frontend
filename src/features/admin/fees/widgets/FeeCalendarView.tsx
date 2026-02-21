// frontend/src/features/admin/fees/widgets/FeeCalendarView.tsx
// Shared calendar grid — works for both Admin and Student views.

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  TrendingDown,
  Banknote,
  Lock,
  Info,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useFeeCalendar } from "../hooks/useFees";
import type { FeeCalendarMonth, FeeStatus } from "../types/fee.types";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  PAID: {
    label: "Paid",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
  },
  DUE: {
    label: "Due",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: <AlertCircle size={14} className="text-rose-500" />,
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <Clock size={14} className="text-amber-500" />,
  },
  NO_RECORD: {
    label: "—",
    bg: "bg-slate-50",
    text: "text-slate-400",
    border: "border-slate-100",
    icon: <CalendarDays size={14} className="text-slate-300" />,
  },
  NOT_GENERATED: {
    label: "Not Yet",
    bg: "bg-slate-50",
    text: "text-slate-400",
    border: "border-slate-100",
    icon: <CalendarDays size={14} className="text-slate-300" />,
  },
};

function getStatusConfig(status: FeeStatus | string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG["NO_RECORD"];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FeeCalendarViewProps {
  studentId: string;
  /** initial year to show; defaults to current year */
  initialYear?: number;
  /** if true, hides admin-only pay/collect buttons */
  readOnly?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FeeCalendarView: React.FC<FeeCalendarViewProps> = ({
  studentId,
  initialYear,
  readOnly = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear ?? currentYear);
  const [selected, setSelected] = useState<FeeCalendarMonth | null>(null);

  const { data, isLoading } = useFeeCalendar(studentId, year);

  const calendar = data?.calendar ?? [];
  const summary = data?.summary;

  // close detail panel if user navigates year
  const handleYearChange = (delta: number) => {
    setYear((y) => y + delta);
    setSelected(null);
  };

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Year Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 ring-1 ring-slate-200 shadow-sm">
        <button
          onClick={() => handleYearChange(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-black text-slate-900 text-lg tracking-tight">{year}</p>
          {summary && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {summary.paidMonths} paid · {summary.dueMonths} due · {summary.pendingMonths} pending
            </p>
          )}
        </div>

        <button
          onClick={() => handleYearChange(1)}
          disabled={year >= currentYear}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Year Summary Chips ────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryChip
            label="Total Paid"
            value={formatCurrency(summary.totalPaid)}
            color="text-emerald-700 bg-emerald-50 ring-emerald-100"
          />
          <SummaryChip
            label="Total Due"
            value={formatCurrency(summary.totalDue)}
            color="text-rose-700 bg-rose-50 ring-rose-100"
          />
          <SummaryChip
            label="Pending"
            value={formatCurrency(summary.totalPending)}
            color="text-amber-700 bg-amber-50 ring-amber-100"
          />
        </div>
      )}

      {/* ── 12-Month Calendar Grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {calendar.map((cell) => (
          <MonthCell
            key={`${cell.month}-${cell.year}`}
            cell={cell}
            isSelected={
              selected?.month === cell.month && selected?.year === cell.year
            }
            onClick={() =>
              setSelected(
                selected?.month === cell.month && selected?.year === cell.year
                  ? null
                  : cell,
              )
            }
          />
        ))}
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────── */}
      {selected && (
        <DetailPanel
          cell={selected}
          readOnly={readOnly}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

// ─── MonthCell ─────────────────────────────────────────────────────────────────

const MonthCell: React.FC<{
  cell: FeeCalendarMonth;
  isSelected: boolean;
  onClick: () => void;
}> = ({ cell, isSelected, onClick }) => {
  const cfg = getStatusConfig(cell.status);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = cell.month === currentMonth && cell.year === currentYear;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full text-left rounded-2xl border p-4 transition-all shadow-sm
        ${cfg.bg} ${cfg.border}
        ${isSelected ? "ring-2 ring-offset-1 ring-slate-900 scale-[1.02]" : "hover:scale-[1.01] hover:shadow-md"}
        ${!cell.hasRecord ? "opacity-60" : ""}
        active:scale-[0.98]
      `}
    >
      {/* Current month indicator */}
      {isCurrentMonth && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      )}

      {/* Month name */}
      <p className={`font-black text-sm ${cfg.text} leading-tight`}>
        {cell.label.split(" ")[0]}
      </p>

      {/* Status */}
      <div className="flex items-center gap-1 mt-1.5">
        {cfg.icon}
        <span className={`text-[9px] font-black uppercase tracking-wider ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      {/* Amount */}
      {cell.hasRecord && (
        <p className="mt-2 font-black text-slate-900 text-sm leading-none">
          {formatCurrency(cell.paidAmount > 0 ? cell.paidAmount : cell.totalAmount)}
        </p>
      )}

      {/* Partial payment indicator */}
      {cell.hasRecord && cell.status === "DUE" && cell.paidAmount > 0 && (
        <p className="text-[8px] font-bold text-rose-500 mt-0.5">
          partial · ₹{cell.remainingAmount} due
        </p>
      )}

      {/* Days overdue */}
      {cell.daysOverdue > 0 && (
        <div className="mt-1.5 inline-flex items-center gap-0.5 bg-rose-100 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
          <TrendingDown size={8} />
          {cell.daysOverdue}d late
        </div>
      )}

      {/* Lock icon */}
      {cell.locked && (
        <Lock size={9} className="absolute bottom-2 right-2 text-emerald-500" />
      )}
    </button>
  );
};

// ─── DetailPanel ───────────────────────────────────────────────────────────────

const DetailPanel: React.FC<{
  cell: FeeCalendarMonth;
  readOnly: boolean;
  onClose: () => void;
}> = ({ cell, onClose }) => {
  const cfg = getStatusConfig(cell.status);

  return (
    <div
      className={`rounded-3xl border p-6 space-y-4 shadow-sm ${cfg.bg} ${cfg.border} animate-in slide-in-from-top-2 duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <h3 className="font-black text-slate-900 text-base">{cell.label}</h3>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white/60 text-slate-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DetailChip label="Base Fee" value={formatCurrency(cell.baseFee)} />
        {cell.dueCarriedForward > 0 && (
          <DetailChip
            label="Arrears"
            value={`+${formatCurrency(cell.dueCarriedForward)}`}
            className="text-rose-700"
          />
        )}
        <DetailChip label="Total Payable" value={formatCurrency(cell.totalAmount)} bold />
        <DetailChip label="Amount Paid" value={formatCurrency(cell.paidAmount)} />
        {cell.remainingAmount > 0 && (
          <DetailChip
            label="Remaining Due"
            value={formatCurrency(cell.remainingAmount)}
            className="text-rose-700"
            bold
          />
        )}
        {cell.paymentDate && (
          <DetailChip
            label="Paid On"
            value={new Date(cell.paymentDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
        )}
        {cell.paymentMethod && (
          <DetailChip label="Method" value={cell.paymentMethod} />
        )}
        {cell.daysOverdue > 0 && (
          <DetailChip
            label="Days Overdue"
            value={`${cell.daysOverdue} days`}
            className="text-rose-700"
            bold
          />
        )}
        {cell.feeDueDate && (
          <DetailChip
            label="Due By"
            value={new Date(cell.feeDueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
        )}
      </div>

      {/* Remarks */}
      {cell.remarks && (
        <div className="flex items-start gap-2 bg-white/60 rounded-2xl p-3 text-sm text-slate-600">
          <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="font-medium text-xs">{cell.remarks}</p>
        </div>
      )}

      {/* Advance covered notice */}
      {cell.coveredByAdvance && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl p-3 text-xs font-bold text-blue-700">
          <Banknote size={14} />
          This month was covered by advance balance
        </div>
      )}

      {/* Partial payment notice */}
      {cell.status === "DUE" && cell.paidAmount > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs font-bold text-amber-700 space-y-1">
          <p>⚠️ Partial payment received</p>
          <p className="font-medium text-amber-600">
            Paid: {formatCurrency(cell.paidAmount)} · Remaining:{" "}
            {formatCurrency(cell.remainingAmount)} will carry forward to next month.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const SummaryChip: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div className={`rounded-2xl p-3 ring-1 ${color} text-center`}>
    <p className="font-black text-base leading-tight">{value}</p>
    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-70">{label}</p>
  </div>
);

const DetailChip: React.FC<{
  label: string;
  value: string;
  className?: string;
  bold?: boolean;
}> = ({ label, value, className = "text-slate-700", bold }) => (
  <div className="bg-white/70 rounded-xl p-3">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm mt-1 ${bold ? "font-black" : "font-bold"} ${className}`}>{value}</p>
  </div>
);

const CalendarSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-16 rounded-2xl" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 12 }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  </div>
);

export default FeeCalendarView;
