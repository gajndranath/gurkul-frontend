// frontend/src/features/admin/fees/components/modals/PaymentActionModal.tsx
import React from "react";
import {
  useForm,
  useWatch,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";
import { usePaymentActions } from "@/features/admin/fees/hooks/useFees";
import * as feeApi from "@/features/admin/fees/api/feeApi";
import { formatFeeMonth } from "@/features/admin/fees/lib/feeUtils";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from "@/components/ui";
import type { FeeHistoryItem } from "@/features/admin/fees/types/fee.types";

const paymentSchema = z.object({
  paidAmount: z.coerce.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "ADVANCE"]),
  transactionId: z.string().optional(),
  remarks: z.string().max(100, "Remarks too long").optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentActionModalProps {
  studentId: string;
  item: FeeHistoryItem;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentActionModal: React.FC<PaymentActionModalProps> = ({
  studentId,
  item,
  isOpen,
  onClose,
}) => {
  const { recordPayment, isProcessing } = usePaymentActions(studentId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      paidAmount: item.totalAmount,
      paymentMethod: "UPI",
      transactionId: "",
      remarks: "",
    },
  });

  const selectedMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  const paidAmount = useWatch({
    control,
    name: "paidAmount",
  });

  const totalAmount = item.totalAmount;
  const remainingDue = Math.max(0, totalAmount - (paidAmount || 0));
  const isPartialPayment = paidAmount > 0 && paidAmount < totalAmount;

  // ✅ Handle Mark as Due
  const handleMarkAsDue = async () => {
    try {
      await feeApi.markFeeAsDue(studentId, item.month, item.year, new Date());
      toast.success("Success", "Fee marked as due");
      onClose();
    } catch {
      toast.error("Error", "Failed to mark as due");
    }
  };

  const onSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    await recordPayment({
      month: item.month,
      year: item.year,
      data,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
    z-[9999]
    w-[92vw] max-w-[400px] 
    rounded-[32px] p-0 overflow-hidden 
    border-none shadow-2xl bg-white outline-none 
    [&>button]:hidden
    max-h-[90vh] 
    /* ✅ FIX: Custom scrollbar with padding for rounded corners */
    overflow-y-auto custom-scrollbar
    /* ✅ Extra padding to prevent content cut-off */
    [&::-webkit-scrollbar-track]:mt-2
    [&::-webkit-scrollbar-track]:mb-2
    [&::-webkit-scrollbar-track]:mr-1
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
            <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <CreditCard size={20} className="text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
                Registry Collect<span className="text-blue-600">.</span>
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                Node Sync: {formatFeeMonth(item.month, item.year)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Amount to Collect
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600">
                ₹
              </span>
              <Input
                type="number"
                {...register("paidAmount")}
                className="pl-8 h-14 rounded-2xl border-none bg-slate-50 font-black text-xl focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
              />
            </div>
            {errors.paidAmount && (
              <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">
                {errors.paidAmount.message}
              </p>
            )}
          </div>

          {/* ✅ Partial Payment Warning */}
          {isPartialPayment && (
            <div className="p-4 bg-orange-50 rounded-[24px] flex gap-3 items-start border border-orange-100">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-orange-700 font-bold leading-relaxed">
                <p className="font-black uppercase tracking-wider">
                  Partial Payment
                </p>
                <p className="mt-1">
                  Paid: {formatCurrency(paidAmount)} | Remaining Due:{" "}
                  {formatCurrency(remainingDue)}
                </p>
                <p className="text-orange-600/80 text-[9px] mt-1.5 font-medium">
                  The remaining amount will be added to due records.
                </p>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Collection Channel
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["CASH", "UPI", "BANK_TRANSFER", "ADVANCE"].map((method) => (
                <label
                  key={method}
                  className={`
                    flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 cursor-pointer transition-all active:scale-95
                    ${
                      selectedMethod === method
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm shadow-blue-100"
                        : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={method}
                    {...register("paymentMethod")}
                    className="hidden"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-none">
                    {method.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ Transaction ID - Conditional: Only show for non-CASH */}
          {selectedMethod !== "CASH" && selectedMethod !== "ADVANCE" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Transaction Registry ID
              </label>
              <Input
                {...register("transactionId")}
                placeholder="UPI ID / Bank Ref / Cheque No."
                className="rounded-2xl h-12 border-none bg-slate-50 text-xs font-bold"
              />
            </div>
          )}

          {/* ✅ Advance Payment Note */}
          {selectedMethod === "ADVANCE" && (
            <div className="p-4 bg-blue-50 rounded-[24px] flex gap-3 items-start border border-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                Advance payment will be added to student's advance balance.
                <span className="block text-blue-600/80 text-[9px] mt-1.5 font-medium">
                  Available advance will be shown in student ledger.
                </span>
              </p>
            </div>
          )}

          {/* Remarks Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Remarks (Optional)
            </label>
            <Input
              {...register("remarks")}
              placeholder="Add payment notes..."
              className="rounded-2xl h-12 border-none bg-slate-50 text-xs font-bold"
            />
          </div>

          {/* Ledger Verification Hint */}
          <div className="p-4 bg-emerald-50 rounded-[24px] flex gap-3 items-start border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase tracking-tight">
              Collection will be logged to the{" "}
              <span className="text-emerald-900 underline">
                Official Ledger
              </span>
              . This action is immutable once confirmed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest h-14"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-[2] rounded-2xl font-black bg-slate-900 hover:bg-blue-600 text-white h-14 shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
              >
                {isProcessing ? "Initialising..." : "Confirm Collection"}
              </Button>
            </div>

            {/* ✅ Mark as Due Button - Separate line */}
            {item.status !== "PAID" && item.status !== "DUE" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleMarkAsDue}
                className="w-full rounded-2xl border-rose-200 text-rose-600 font-black text-[10px] uppercase tracking-widest h-12 hover:bg-rose-600 hover:text-white transition-all"
              >
                <AlertCircle size={14} className="mr-2" />
                Mark as Due
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentActionModal;
