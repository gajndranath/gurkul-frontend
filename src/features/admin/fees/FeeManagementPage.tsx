import React, { Suspense, lazy } from "react";
import FeeDashboardWidget from "./widgets/FeeDashboardWidget";
import OverdueSummaryWidget from "./widgets/OverdueSummaryWidget";
import { CreditCard, Loader2, ShieldCheck, PieChart, LayoutList, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load the table for better initial page speed
const StudentFeeTableWidget = lazy(
  () => import("./widgets/StudentFeeTableWidget"),
);

const FeeManagementPage: React.FC = () => {
  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* 1. PAGE HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blue-600 mb-0.5 sm:mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <CreditCard size={14} className="sm:size-[16px]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              Financial Terminal
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter italic">
            Financial Command<span className="text-blue-600"> Center.</span>
          </h1>
          <p className="text-slate-500 font-medium text-[10px] sm:text-sm max-w-md leading-relaxed">
             Institutional liquidity control, automated arrears tracking, and streamlined ledger management.
          </p>
        </div>

        <div className="hidden xs:flex items-center gap-3 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl ring-1 ring-slate-200 shadow-sm">
          <div className="text-right">
            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Ledger Status
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-500 flex items-center justify-end gap-1.5 mt-0.5 sm:mt-1">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified
            </p>
          </div>
          <div className="h-6 sm:h-8 w-[1px] bg-slate-100 mx-1" />
          <ShieldCheck className="text-blue-600 w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
        </div>
      </header>

      {/* 2. COMMAND TABS: The core reorganization */}
      <Tabs defaultValue="analytics" className="space-y-6 sm:space-y-8 mt-6 sm:mt-10">
        <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-px scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent h-12 p-0 gap-4 sm:gap-8 justify-start flex-nowrap">
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-1 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
            >
              <PieChart size={14} /> Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="ledger" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-1 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
            >
              <LayoutList size={14} /> Ledger
            </TabsTrigger>
            <TabsTrigger 
              value="dues" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-rose-600 rounded-none h-full px-1 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-rose-600 gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
            >
              <AlertCircle size={14} /> Arrears
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analytics" className="animate-in slide-in-from-bottom-2 duration-500">
           <FeeDashboardWidget />
        </TabsContent>

        <TabsContent value="ledger" className="animate-in slide-in-from-bottom-2 duration-500">
           <Suspense fallback={<LedgerSkeleton />}>
              <StudentFeeTableWidget />
           </Suspense>
        </TabsContent>

        <TabsContent value="dues" className="animate-in slide-in-from-bottom-2 duration-500">
           <OverdueSummaryWidget />
        </TabsContent>
      </Tabs>

      {/* FOOTER */}
      <footer className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200/60 pb-10">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          <LegendItem color="bg-emerald-500" label="Fully Liquid" />
          <LegendItem color="bg-rose-500" label="Capital Risk" />
          <LegendItem color="bg-amber-500" label="In-Transit" />
        </div>

        <div className="text-center md:text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
            Financial Orchestration Suite v3.1
          </p>
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-1 italic">
            Automated Escalation Logic Active
          </p>
        </div>
      </footer>
    </div>
  );
};

const LedgerSkeleton = () => (
  <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[32px] ring-1 ring-slate-200 gap-4 shadow-sm border border-dashed border-slate-100">
    <Loader2 className="animate-spin text-blue-600" size={32} />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconstructing Ledger...</p>
  </div>
);

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
