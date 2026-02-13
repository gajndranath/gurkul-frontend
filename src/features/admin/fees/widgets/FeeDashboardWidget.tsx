// frontend/src/features/admin/fees/widgets/FeeDashboardWidget.tsx
import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // ✅ IMPORT ADDED
import {
  Activity,
  AlertCircle,
  ArrowRight,
  PieChart,
  FileText,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useFeeDashboard } from "../hooks/useFeeDashboard";
import { formatCurrency } from "../../../../lib/utils";
import { Card, CardContent, Button } from "../../../../components/ui";

const FeeDashboardWidget: React.FC = memo(() => {
  const navigate = useNavigate(); // ✅ HOOK ADDED
  const { data, isLoading } = useFeeDashboard();

  const stats = useMemo(
    () =>
      data?.stats || {
        total: 0,
        paid: 0,
        due: 0,
        pending: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        pendingAmount: 0,
      },
    [data],
  );

  const metrics = useMemo(
    () => ({
      eff:
        stats.totalAmount > 0
          ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
          : 0,
      gap: Math.max(0, stats.totalAmount - stats.paidAmount),
    }),
    [stats],
  );

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-[32px] animate-pulse font-black text-slate-400 uppercase tracking-widest text-[10px]">
        Generating Financial Pulse...
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700">
      {/* 1. PRIMARY METRIC */}
      <Card className="lg:col-span-2 border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} /> Live Revenue Pulse
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                {metrics.eff}%{" "}
                <span className="text-slate-400 text-base md:text-lg font-bold">
                  Collected
                </span>
              </h2>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
              <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                {formatCurrency(stats.paidAmount)}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Target: {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-3 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 md:p-1 shadow-inner">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                style={{ width: `${metrics.eff}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Billing Cycle</span>
              <span className="text-blue-600">Objective Pulse</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 border-t border-slate-50 pt-8">
            <MiniStat
              label="Paid"
              value={stats.paid}
              color="text-emerald-600"
            />
            <MiniStat
              label="Pending"
              value={stats.pending}
              color="text-amber-500"
            />
            <MiniStat label="Overdue" value={stats.due} color="text-rose-600" />
            <MiniStat
              label="Total Active"
              value={stats.total}
              color="text-slate-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. REVENUE GAP & ENHANCED AUDIT SECTION */}
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Revenue Gap Card */}
        <Card className="border-none ring-1 ring-rose-100 shadow-sm rounded-[24px] md:rounded-[32px] bg-rose-50/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Revenue Gap
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600 tracking-tighter">
                {formatCurrency(metrics.gap)}
              </p>
              <p className="text-[10px] font-medium text-rose-500/80 mt-1 italic">
                Outstanding arrears
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-all text-[10px] h-10 uppercase tracking-widest"
              onClick={() => navigate("/admin/due")}
            >
              Review Dues <ArrowRight size={14} className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* --- ENHANCED AUDIT REPORT CARD --- */}
        <Card className="flex-1 border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] bg-slate-900 text-white overflow-hidden flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl">
                <PieChart size={20} className="text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Efficiency
                </p>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp size={12} />
                  <span className="text-xs font-black">+12.4%</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-black tracking-tight">
                Audit Terminal
              </h3>
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.1em]">
                Verified Cycle Summary
              </p>
            </div>

            {/* Quick Audit Actions */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group">
                <FileText size={14} className="text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Export PDF
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                <Share2 size={14} className="text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Dispatch
                </span>
              </button>
            </div>

            <Button className="w-full mt-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 shadow-lg shadow-blue-900/20">
              Full System Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

const MiniStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="space-y-1">
    <p className={`${color} text-lg md:text-xl font-black tracking-tighter`}>
      {value}
    </p>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">
      {label}
    </p>
  </div>
);

FeeDashboardWidget.displayName = "FeeDashboardWidget";
export default FeeDashboardWidget;
