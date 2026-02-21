// frontend/src/features/admin/fees/widgets/StudentFeeLedgerWidget.tsx

import React, { memo, useState, useMemo } from "react";
import {
  History,
  Plus,
  Receipt,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { useFeeSummary } from "../hooks/useFees";
import { getStatusConfig, formatFeeMonth } from "../lib/feeUtils";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import type { FeeHistoryItem } from "../types/fee.types";

// Import modals
import PaymentActionModal from "./PaymentActionModal";
import AddAdvanceModal from "../components/modals/AddAdvanceModal";
import ApplyAdvanceModal from "../components/modals/ApplyAdvanceModal";
import ReceiptModal from "../components/modals/ReceiptModal";
import FeeCalendarView from "./FeeCalendarView";

interface StudentFeeLedgerWidgetProps {
  studentId: string;
}

type ViewTab = "timeline" | "calendar";

const StudentFeeLedgerWidget: React.FC<StudentFeeLedgerWidgetProps> = memo(
  ({ studentId }) => {
    const { data, isLoading, refetch } = useFeeSummary(studentId);
    const toast = useToast();

    const [view, setView] = useState<ViewTab>("timeline");
    const [activePaymentItem, setActivePaymentItem] =
      useState<FeeHistoryItem | null>(null);
    const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);
    const [isApplyAdvanceOpen, setIsApplyAdvanceOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] =
      useState<FeeHistoryItem | null>(null);

    const feeHistory = useMemo(() => data?.feeHistory || [], [data]);
    const advance = data?.advance || null;
    const currentDue = data?.currentDue || null;

    if (isLoading) return <FeeLedgerSkeleton />;

    const handleExportLedger = () => {
      toast.info("Export", "Ledger export coming soon");
    };

    return (
      <>
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* 1. TOP BAR: Summary Cards + Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Advance Card */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Wallet size={20} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-tighter"
                  >
                    Credit
                  </Badge>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(advance?.remainingAmount || 0)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Available Advance
                </p>
              </CardContent>
            </Card>

            {/* Dues Card */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                    <CreditCard size={20} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-tighter text-rose-600 border-rose-100"
                  >
                    Dues
                  </Badge>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(currentDue?.totalDueAmount || 0)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Total Outstanding
                </p>
                {currentDue?.monthsDue && currentDue.monthsDue.length > 0 && (
                  <p className="text-[9px] font-bold text-rose-400 mt-1">
                    {currentDue.monthsDue.length} month{currentDue.monthsDue.length > 1 ? "s" : ""} overdue
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-row sm:flex-col lg:flex-col gap-3 sm:col-span-2 lg:col-span-1">
              <Button
                className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-lg shadow-blue-100 h-12 lg:h-full"
                onClick={() => setIsAddAdvanceOpen(true)}
              >
                <Plus size={18} />
                <span className="xs:inline">Add Advance</span>
              </Button>

              {(advance?.remainingAmount || 0) > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all gap-2 h-12 lg:h-full shadow-sm"
                  onClick={() => setIsApplyAdvanceOpen(true)}
                >
                  <CreditCard size={18} className="text-emerald-600" />
                  <span className="xs:inline">Apply Advance</span>
                </Button>
              )}

              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 h-12 lg:h-full shadow-sm"
                onClick={handleExportLedger}
              >
                <Download size={18} className="text-slate-400" />
                <span className="hidden xs:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* 2. View Tab Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <TabButton active={view === "timeline"} onClick={() => setView("timeline")} icon={<History size={14} />}>
              Timeline
            </TabButton>
            <TabButton active={view === "calendar"} onClick={() => setView("calendar")} icon={<Calendar size={14} />}>
              Calendar
            </TabButton>
          </div>

          {/* 3. TIMELINE VIEW */}
          {view === "timeline" && (
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-blue-600" />
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm sm:text-base">
                    Payment Timeline
                  </h3>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-full">
                  Live Ledger
                </span>
              </div>

              <CardContent className="p-0">
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden sm:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Breakdown</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid / Total</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {feeHistory.map((item: FeeHistoryItem) => {
                        const status = getStatusConfig(item.status);
                        return (
                          <tr
                            key={`${item.year}-${item.month}`}
                            className="group hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Period */}
                            <td className="px-6 py-5">
                              <p className="font-bold text-slate-900 text-sm">
                                {formatFeeMonth(item.month, item.year)}
                              </p>
                              {item.locked && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase mt-1">
                                  <ShieldCheck size={10} className="text-emerald-500" />
                                  Cleared
                                </span>
                              )}
                            </td>

                            {/* Breakdown */}
                            <td className="px-6 py-5">
                              <div className="text-xs font-bold text-slate-500">
                                {formatCurrency(item.baseFee)}
                                {item.dueCarriedForward > 0 && (
                                  <>
                                    <span className="text-slate-300 mx-1">+</span>
                                    <span className="text-rose-500">{formatCurrency(item.dueCarriedForward)} arrears</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Paid / Total */}
                            <td className="px-6 py-5">
                              <p className="font-black text-slate-900 text-sm">
                                {formatCurrency(item.paidAmount)}{" "}
                                <span className="font-medium text-slate-300">/ {formatCurrency(item.totalAmount)}</span>
                              </p>
                              {item.daysOverdue > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-rose-500 mt-0.5 uppercase">
                                  <TrendingDown size={9} />
                                  {item.daysOverdue}d late
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-5">
                              <Badge
                                className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase ${status.color}`}
                              >
                                {status.label}
                              </Badge>
                            </td>

                            {/* Payment Date */}
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold text-slate-500">
                                {item.paymentDate
                                  ? new Date(item.paymentDate).toLocaleDateString("en-IN", {
                                      day: "2-digit", month: "short", year: "2-digit",
                                    })
                                  : <span className="text-slate-300">—</span>}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-5 text-right">
                              <ActionToggle
                                item={item}
                                onPay={() => setActivePaymentItem(item)}
                                onViewReceipt={() => setSelectedReceipt(item)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {feeHistory.map((item: FeeHistoryItem) => {
                    const status = getStatusConfig(item.status);
                    return (
                      <div
                        key={`${item.year}-${item.month}`}
                        className="p-5 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-black text-slate-900 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-600" />
                              {formatFeeMonth(item.month, item.year)}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`rounded-md text-[8px] font-black uppercase ${status.color}`}
                              >
                                {status.label}
                              </Badge>
                              {item.locked && (
                                <ShieldCheck size={12} className="text-emerald-500" />
                              )}
                              {item.daysOverdue > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-rose-500 uppercase">
                                  <TrendingDown size={8} />
                                  {item.daysOverdue}d late
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900">
                              {formatCurrency(item.paidAmount)}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              of {formatCurrency(item.totalAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-500 space-y-0.5">
                            <div>Base: {formatCurrency(item.baseFee)}</div>
                            {item.dueCarriedForward > 0 && (
                              <div className="text-rose-500">Arrears: +{formatCurrency(item.dueCarriedForward)}</div>
                            )}
                            {item.paymentDate && (
                              <div className="text-slate-400">
                                Paid: {new Date(item.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              </div>
                            )}
                          </div>
                          <ActionToggle
                            item={item}
                            onPay={() => setActivePaymentItem(item)}
                            onViewReceipt={() => setSelectedReceipt(item)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. CALENDAR VIEW */}
          {view === "calendar" && (
            <FeeCalendarView studentId={studentId} />
          )}
        </div>

        {/* Modals */}
        {activePaymentItem && (
          <PaymentActionModal
            studentId={studentId}
            item={activePaymentItem}
            isOpen={!!activePaymentItem}
            onClose={() => setActivePaymentItem(null)}
          />
        )}

        <AddAdvanceModal
          isOpen={isAddAdvanceOpen}
          onClose={() => setIsAddAdvanceOpen(false)}
          onSuccess={() => {
            refetch();
            toast.success("Success", "Advance added successfully");
          }}
          preselectedStudentId={studentId}
        />

        <ApplyAdvanceModal
          studentId={studentId}
          isOpen={isApplyAdvanceOpen}
          onClose={() => setIsApplyAdvanceOpen(false)}
          onSuccess={() => {
            refetch();
            toast.success("Success", "Advance applied successfully");
          }}
        />

        {selectedReceipt && (
          <ReceiptModal
            studentId={studentId}
            month={selectedReceipt.month}
            year={selectedReceipt.year}
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </>
    );
  },
);

// ─── TabButton ────────────────────────────────────────────────────────────────

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
    }`}
  >
    {icon}
    {children}
  </button>
);

// ─── ActionToggle ─────────────────────────────────────────────────────────────

const ActionToggle = ({
  item,
  onPay,
  onViewReceipt,
}: {
  item: FeeHistoryItem;
  onPay: () => void;
  onViewReceipt: () => void;
}) => {
  if (item.status !== "PAID") {
    return (
      <Button
        size="sm"
        className="rounded-xl h-9 px-4 bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase text-white shadow-md transition-all active:scale-95"
        onClick={onPay}
      >
        Pay <ArrowUpRight size={14} className="ml-1" />
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl h-9 w-9 p-0 text-slate-300 hover:text-blue-600 hover:bg-blue-50"
      onClick={onViewReceipt}
    >
      <Receipt size={18} />
    </Button>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const FeeLedgerSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-[24px]" />
      ))}
    </div>
    <Skeleton className="h-[400px] rounded-[32px]" />
  </div>
);

StudentFeeLedgerWidget.displayName = "StudentFeeLedgerWidget";
export default StudentFeeLedgerWidget;
