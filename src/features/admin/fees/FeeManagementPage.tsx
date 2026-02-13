import React, { Suspense, lazy } from "react";
import FeeDashboardWidget from "./widgets/FeeDashboardWidget";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Separator } from "../../../components/ui/separator";

// Lazy load the table for better initial page speed
const StudentFeeTableWidget = lazy(
  () => import("./widgets/StudentFeeTableWidget"),
);

const FeeManagementPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* 1. PAGE HEADER: Responsive Flex */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <CreditCard size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              Financial Terminal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Fee Management
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
            Monitor institutional liquidity, track arrears, and manage student
            payment lifecycles.
          </p>
        </div>

        {/* System Status: Hidden on very small screens, visible from 'xs' up */}
        <div className="hidden xs:flex items-center gap-3 bg-white p-3 rounded-2xl ring-1 ring-slate-200 shadow-sm">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Node Status
            </p>
            <p className="text-[11px] font-bold text-emerald-500 flex items-center justify-end gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Synchronized
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-1" />
          <ShieldCheck className="text-blue-600" size={20} />
        </div>
      </header>

      {/* 2. ANALYTICS LAYER: Scalable Stats */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Revenue Intelligence
          </h2>
          <Separator className="flex-1 opacity-50" />
        </div>
        <FeeDashboardWidget />
      </section>

      {/* 3. OPERATIONS LAYER: Active Ledger */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
              Member Ledger
            </h2>
            <Separator className="flex-1 opacity-50" />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-64 sm:h-96 flex flex-col items-center justify-center bg-white rounded-[24px] sm:rounded-[32px] ring-1 ring-slate-200 gap-4 shadow-sm">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  Hydrating Data
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Parsing Financial Records...
                </p>
              </div>
            </div>
          }
        >
          <StudentFeeTableWidget />
        </Suspense>
      </section>

      {/* 4. FOOTER: Mobile Optimized Stack */}
      <footer className="pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200/60 pb-10">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          <LegendItem color="bg-emerald-500" label="Fully Paid" />
          <LegendItem color="bg-rose-500" label="Arrears Due" />
          <LegendItem color="bg-amber-500" label="Processing" />
        </div>

        <div className="text-center md:text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
            Library Management Protocol v2.6
          </p>
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-1">
            Secure Encryption Enabled • 256-bit Ledger
          </p>
        </div>
      </footer>
    </div>
  );
};

// Internal Page Helper with Responsive Text
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2 group cursor-default">
    <div
      className={`h-2 w-2 rounded-full ${color} shadow-sm group-hover:scale-125 transition-transform`}
    />
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
      {label}
    </span>
  </div>
);

export default FeeManagementPage;
