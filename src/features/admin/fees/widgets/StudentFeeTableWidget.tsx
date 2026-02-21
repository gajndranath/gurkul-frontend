// frontend/src/features/admin/fees/widgets/StudentFeeTableWidget.tsx

import React, { memo, useState, useMemo } from "react";
import { Search, Filter, User, CreditCard, Receipt } from "lucide-react"; // ✅ ADDED Receipt icon
import { useFeeDashboard } from "../hooks/useFeeDashboard";
import { getStatusConfig } from "../lib/feeUtils";
import { formatCurrency } from "@/lib/utils"; // ✅ FIXED import path
import { Card, CardContent, Input, Button, Badge } from "@/components/ui";

import PaymentActionModal from "./PaymentActionModal";
import ReceiptModal from "../components/modals/ReceiptModal"; // ✅ NEW
import type {
  DashboardPaymentStatus,
  FeeStatus,
  FeeHistoryItem,
} from "../types/fee.types";

type FeeDetailItem = DashboardPaymentStatus["details"][number];

const StudentFeeTableWidget: React.FC = memo(() => {
  const { data, isLoading } = useFeeDashboard();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FeeStatus | "ALL">("ALL");
  const [paymentItem, setPaymentItem] = useState<FeeDetailItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeDetailItem | null>(
    null,
  ); // ✅ NEW

  const filteredData = useMemo(() => {
    const details = data?.details ?? [];
    return details.filter((item: FeeDetailItem) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        (item.studentId?.toLowerCase() || "unknown").includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "ALL" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, filterStatus]);

  if (isLoading)
    return (
      <div className="h-96 bg-slate-50/50 animate-pulse rounded-[32px] border border-dashed border-slate-200" />
    );

  return (
    <div className="space-y-4">
      {/* 1. SEARCH & FILTER HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white p-4 sm:p-6 rounded-[24px] ring-1 ring-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search student or ID..."
            className="pl-10 h-11 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          {(["ALL", "PAID", "DUE", "PENDING", "NOT_GENERATED"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus(status as FeeStatus | "ALL")}
              className={`rounded-xl px-4 font-black text-[9px] uppercase tracking-widest transition-all shrink-0 ${
                filterStatus === status
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* 2. MAIN LEDGER CONTAINER */}
      <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[32px] overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Member
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Slot Info
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item: FeeDetailItem, index: number) => {
                  const statusCfg = getStatusConfig(item.status);
                  return (
                    <tr
                      key={`${item.studentId || "unknown"}-${item.month}-${item.year}-${index}`}
                      className="group hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">
                          {item.studentName}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter italic">
                          ID: {(item.studentId || "unknown").slice(-6)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[9px] font-bold border-slate-100 bg-slate-50/50 text-slate-500 uppercase"
                        >
                          {item.studentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-900 text-sm">
                          {formatCurrency(item.totalAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ActionToggle
                          item={item}
                          onCollect={() => setPaymentItem(item)}
                          onViewReceipt={() => setSelectedReceipt(item)} // ✅ NEW
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredData.map((item: FeeDetailItem, index: number) => {
              const statusCfg = getStatusConfig(item.status);
              return (
                <div key={`${item.studentId || "unknown"}-${item.month}-${item.year}-${index}`} className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">
                          {item.studentName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          ID: {(item.studentId || "unknown").slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`rounded-md text-[8px] font-black uppercase ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-2xl ring-1 ring-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {item.status === "PAID" ? "Amount Paid" : "Amount Due"}
                      </p>
                      <p className="text-lg font-black text-slate-900 leading-none">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <ActionToggle
                      item={item}
                      onCollect={() => setPaymentItem(item)}
                      onViewReceipt={() => setSelectedReceipt(item)} // ✅ NEW
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto ring-1 ring-slate-100">
                <Filter className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                No Matching Records Found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Action Modal */}
      {paymentItem && (
        <PaymentActionModal
          studentId={paymentItem.studentId}
          item={paymentItem as unknown as FeeHistoryItem}
          isOpen={!!paymentItem}
          onClose={() => setPaymentItem(null)}
        />
      )}

      {/* ✅ NEW: Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          studentId={selectedReceipt.studentId}
          month={selectedReceipt.month}
          year={selectedReceipt.year}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
});

// ✅ UPDATED: ActionToggle with onViewReceipt prop
const ActionToggle = ({
  item,
  onCollect,
  onViewReceipt,
}: {
  item: FeeDetailItem;
  onCollect: () => void;
  onViewReceipt: () => void;
}) => {
  // ✅ Show Collect button for anything NOT fully paid
  if (item.status !== "PAID") {
    return (
      <Button
        size="sm"
        className="rounded-xl h-9 px-4 bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
        onClick={onCollect}
      >
        Collect <CreditCard size={14} className="ml-1.5" />
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl h-9 w-9 p-0 text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      onClick={onViewReceipt} // ✅ Now functional
      title="View Receipt"
    >
      <Receipt size={18} />
    </Button>
  );
};

StudentFeeTableWidget.displayName = "StudentFeeTableWidget";
export default StudentFeeTableWidget;
