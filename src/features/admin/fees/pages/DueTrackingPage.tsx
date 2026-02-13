// frontend/src/features/admin/fees/pages/DueTrackingPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Bell,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { useDueTracking } from "../hooks/useDueTracking";
import DueSummaryCards from "../components/cards/DueSummaryCards";
import DueTrackingTableWidget from "../widgets/DueTrackingTableWidget";

const DueTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { summary, isLoading, refetch } = useDueTracking();

  const handleExport = () => {
    toast.info("Export", "Due report export coming soon");
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Success", "Due records refreshed");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/fees")}
              className="h-8 w-8 rounded-lg hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <AlertCircle size={16} className="text-rose-600" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
              Arrears Terminal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Due Tracking
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
            Monitor and manage overdue fee payments. Track delinquency rates and
            automate reminder workflows.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* System Status */}
          <div className="hidden xs:flex items-center gap-3 bg-white p-2.5 rounded-2xl ring-1 ring-slate-200 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Node Status
              </p>
              <p className="text-[11px] font-bold text-emerald-500 flex items-center justify-end gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <ShieldCheck className="text-blue-600" size={20} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              title="Export Report"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100"
              onClick={() => navigate("/admin/due/reminders")}
            >
              <Bell className="h-3.5 w-3.5 mr-2" />
              Bulk Reminders
            </Button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Delinquency Overview
          </h2>
          <Separator className="flex-1 opacity-50" />
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-amber-200 bg-amber-50 text-amber-600 whitespace-nowrap"
          >
            {summary?.totalDueStudents || 0} Defaulters
          </Badge>
        </div>
        <DueSummaryCards
          summary={summary}
          isLoading={isLoading}
          onViewAll={() => {
            // Scroll to table
            document.getElementById("due-table")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        />
      </section>

      {/* Table Section */}
      <section id="due-table" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Active Arrears Ledger
          </h2>
          <Separator className="flex-1 opacity-50" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">
                Critical
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">
                High
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">
                Medium
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">
                Low
              </span>
            </div>
          </div>
        </div>

        <DueTrackingTableWidget />
      </section>

      {/* Footer Stats */}
      <footer className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200/60">
        <div className="flex items-center gap-4 text-[9px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Auto-sync every 5 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Real-time updates
          </span>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
            Library Management Protocol • Arrears Module
          </p>
          <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter mt-1">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            IST
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DueTrackingPage;
