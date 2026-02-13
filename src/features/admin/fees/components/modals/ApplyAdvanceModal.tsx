// frontend/src/features/admin/fees/components/modals/ApplyAdvanceModal.tsx

import React, { useState } from "react";
import {
  X,
  DollarSign,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  useStudentAdvance,
  usePendingMonths,
  useApplyAdvance,
} from "@/features/admin/fees/hooks/useAdvance";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { PendingMonth } from "@/features/admin/fees/types/fee.types";

interface ApplyAdvanceModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ApplyAdvanceModal: React.FC<ApplyAdvanceModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  // Hooks
  const { data: advance, isLoading: isLoadingAdvance } =
    useStudentAdvance(studentId);
  const { pendingMonths, isLoading: isLoadingPending } =
    usePendingMonths(studentId);
  const applyAdvanceMutation = useApplyAdvance();

  // State
  const [selectedMonth, setSelectedMonth] = useState<PendingMonth | null>(null);
  const [applyAmount, setApplyAmount] = useState<number>(0);
  const [isFullAmount, setIsFullAmount] = useState(true);

  // ✅ FIXED: No useEffect - handle in event handlers directly
  const handleMonthChange = (value: string) => {
    const [month, year] = value.split("-").map(Number);
    const monthData = pendingMonths.find(
      (m) => m.month === month && m.year === year,
    );
    if (monthData) {
      setSelectedMonth(monthData);
      setApplyAmount(monthData.amount);
      setIsFullAmount(true);
    }
  };

  const handleApplyFull = () => {
    if (selectedMonth) {
      setApplyAmount(selectedMonth.amount);
      setIsFullAmount(true);
    }
  };

  const handleApplyPartial = () => {
    setIsFullAmount(false);
  };

  const handleAmountChange = (value: number) => {
    setApplyAmount(value);
    if (selectedMonth) {
      setIsFullAmount(value === selectedMonth.amount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMonth) {
      toast.error("Error", "Please select a month to apply advance");
      return;
    }

    if (applyAmount <= 0) {
      toast.error("Error", "Amount must be greater than 0");
      return;
    }

    if (applyAmount > (advance?.remainingAmount || 0)) {
      toast.error("Error", "Amount exceeds available advance balance");
      return;
    }

    if (applyAmount > selectedMonth.amount) {
      toast.error("Error", "Amount cannot exceed monthly fee amount");
      return;
    }

    try {
      await applyAdvanceMutation.mutateAsync({
        studentId,
        month: selectedMonth.month,
        year: selectedMonth.year,
        amount: applyAmount,
      });

      toast.success(
        "Success",
        `Advance applied to ${getMonthName(selectedMonth.month)} ${selectedMonth.year}`,
      );
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in mutation
    }
  };

  // ✅ FIXED: isLoading variable removed (not used)
  const availableBalance = advance?.remainingAmount || 0;
  const hasPendingMonths = pendingMonths.length > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      // ✅ FIXED: Key forces component to reset when studentId changes
      key={studentId}
    >
      <DialogContent
        className="
          z-[9999]
          w-[92vw] max-w-[500px] 
          rounded-[32px] p-0 overflow-hidden 
          border-none shadow-2xl bg-white outline-none 
          [&>button]:hidden
          max-h-[90vh] flex flex-col
        "
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-50 bg-white sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-7 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
              <CreditCard size={20} className="text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
                Apply Advance<span className="text-emerald-600">.</span>
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                Student ID: {studentId.slice(-8)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Available Balance Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 rounded-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                    Available Advance Balance
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-white border-emerald-200 text-emerald-700 text-[9px] font-black"
                >
                  Credit
                </Badge>
              </div>

              {isLoadingAdvance ? (
                <div className="h-10 flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                    {formatCurrency(availableBalance)}
                  </p>
                  <p className="text-[9px] font-medium text-emerald-600/80 mt-1">
                    Total Advance: {formatCurrency(advance?.totalAmount || 0)} •
                    Used: {formatCurrency(advance?.usedAmount || 0)}
                  </p>
                </>
              )}
            </div>

            {/* Month Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Select Month to Apply
              </label>

              {isLoadingPending ? (
                <div className="h-11 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              ) : !hasPendingMonths ? (
                <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                      No Pending Dues
                    </p>
                    <p className="text-[9px] text-amber-700 mt-1">
                      This student has no pending or overdue fees to apply
                      advance against.
                    </p>
                  </div>
                </div>
              ) : (
                <Select
                  value={
                    selectedMonth
                      ? `${selectedMonth.month}-${selectedMonth.year}`
                      : ""
                  }
                  onValueChange={handleMonthChange} // ✅ FIXED: Use handler
                >
                  <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl">
                    <SelectValue placeholder="Choose a month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-slate-200">
                    {pendingMonths.map((month) => (
                      <SelectItem
                        key={`${month.month}-${month.year}`}
                        value={`${month.month}-${month.year}`}
                        className="py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold">
                            {getMonthName(month.month)} {month.year}
                          </span>
                          <Badge
                            variant="outline"
                            className={`
                              ml-4 text-[8px] font-black uppercase
                              ${
                                month.status === "DUE"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                              }
                            `}
                          >
                            {month.status}
                          </Badge>
                          <span className="ml-4 font-black text-slate-900">
                            {formatCurrency(month.amount)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Amount Section - Only show if month selected */}
            {selectedMonth && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <Separator className="bg-slate-100" />

                {/* Month Summary */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Selected Month
                    </span>
                    <Badge
                      variant="outline"
                      className={`
                        text-[8px] font-black uppercase
                        ${
                          selectedMonth.status === "DUE"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }
                      `}
                    >
                      {selectedMonth.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {getMonthName(selectedMonth.month)} {selectedMonth.year}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Monthly Fee + Arrears
                      </p>
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(selectedMonth.amount)}
                    </p>
                  </div>
                </div>

                {/* Amount Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Amount to Apply
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isFullAmount ? "default" : "outline"}
                        size="sm"
                        onClick={handleApplyFull}
                        className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
                      >
                        Full Amount
                      </Button>
                      <Button
                        type="button"
                        variant={!isFullAmount ? "default" : "outline"}
                        size="sm"
                        onClick={handleApplyPartial}
                        className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
                        disabled={availableBalance < selectedMonth.amount}
                      >
                        Partial
                      </Button>
                    </div>
                  </div>

                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-emerald-600">
                      ₹
                    </span>
                    <Input
                      type="number"
                      value={applyAmount || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleAmountChange(value); // ✅ FIXED: Use handler
                      }}
                      className="pl-8 h-14 rounded-2xl border-none bg-slate-50 font-black text-xl focus-visible:ring-2 focus-visible:ring-emerald-600 transition-all"
                      min="1"
                      max={Math.min(selectedMonth.amount, availableBalance)}
                      step="1"
                      disabled={isFullAmount}
                    />
                  </div>

                  {/* Amount Validation Messages */}
                  <div className="space-y-2">
                    {applyAmount > availableBalance && (
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-bold">
                          Exceeds available balance by{" "}
                          {formatCurrency(applyAmount - availableBalance)}
                        </span>
                      </div>
                    )}

                    {applyAmount < selectedMonth.amount && applyAmount > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-bold">
                          Partial payment: Remaining{" "}
                          {formatCurrency(selectedMonth.amount - applyAmount)}{" "}
                          will be due
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[8px] font-medium text-slate-500">
                      <span>Available: {formatCurrency(availableBalance)}</span>
                      <span>
                        Required: {formatCurrency(selectedMonth.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 items-start border border-emerald-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                <p className="font-black uppercase tracking-wider">
                  Secure Transaction
                </p>
                <p className="mt-1 text-emerald-600/80 font-medium">
                  Advance amount will be applied to the selected month. This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest h-12 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  applyAdvanceMutation.isPending ||
                  !selectedMonth ||
                  applyAmount <= 0 ||
                  applyAmount > availableBalance ||
                  applyAmount > (selectedMonth?.amount || 0)
                }
                className="flex-[2] rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-xl shadow-emerald-100 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyAdvanceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Advance
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyAdvanceModal;
