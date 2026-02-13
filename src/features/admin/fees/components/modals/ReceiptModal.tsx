// frontend/src/features/admin/fees/components/modals/ReceiptModal.tsx

import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  Mail,
  Calendar,
  User,
  Phone,
  Mail as MailIcon,
  Receipt,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useReceiptDetails,
  useDownloadReceipt,
  useSendReceiptEmail,
} from "@/features/admin/fees/hooks/useReceipt";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";

interface ReceiptModalProps {
  studentId: string;
  month: number;
  year: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  studentId,
  month,
  year,
  isOpen,
  onClose,
}) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Hooks
  const { data: receipt, isLoading } = useReceiptDetails(
    studentId,
    month,
    year,
  );
  const downloadReceiptMutation = useDownloadReceipt();
  const sendEmailMutation = useSendReceiptEmail();

  const handleDownload = async () => {
    try {
      await downloadReceiptMutation.mutateAsync({
        studentId,
        month,
        year,
      });
    } catch {
      console.error("download error");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && receipt) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt-${receipt.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .receipt { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>${receipt.institutionDetails.name}</h1>
                <p>${receipt.institutionDetails.address}</p>
                <p>${receipt.institutionDetails.phone} | ${receipt.institutionDetails.email}</p>
                ${receipt.institutionDetails.gstin ? `<p>GSTIN: ${receipt.institutionDetails.gstin}</p>` : ""}
                <h2>FEE RECEIPT</h2>
              </div>
              <div class="details">
                <p><strong>Receipt No:</strong> ${receipt.receiptNumber}</p>
                <p><strong>Date:</strong> ${formatDate(receipt.paymentDate)}</p>
                <p><strong>Student Name:</strong> ${receipt.studentName}</p>
                <p><strong>Student ID:</strong> ${receipt.studentId}</p>
                <p><strong>Month/Year:</strong> ${getMonthName(receipt.month)} ${receipt.year}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Fee</td>
                    <td>${formatCurrency(receipt.baseFee)}</td>
                  </tr>
                  <tr>
                    <td>Previous Due</td>
                    <td>${formatCurrency(receipt.dueCarriedForward)}</td>
                  </tr>
                  <tr>
                    <td class="total">Total Amount</td>
                    <td class="total">${formatCurrency(receipt.amount)}</td>
                  </tr>
                  <tr>
                    <td>Paid Amount</td>
                    <td>${formatCurrency(receipt.paidAmount)}</td>
                  </tr>
                </tbody>
              </table>
              <p><strong>Payment Method:</strong> ${receipt.paymentMethod.replace("_", " ")}</p>
              ${receipt.transactionId ? `<p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>` : ""}
              ${receipt.remarks ? `<p><strong>Remarks:</strong> ${receipt.remarks}</p>` : ""}
              <p><strong>Collected By:</strong> ${receipt.collectedBy}</p>
              <p style="text-align: center; margin-top: 40px; color: #666;">This is a system generated receipt</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await sendEmailMutation.mutateAsync({
        studentId,
        month,
        year,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  /*   const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <CreditCard className="h-3.5 w-3.5" />;
      case "UPI":
      case "BANK_TRANSFER":
        return <Mail className="h-3.5 w-3.5" />;
      default:
        return <CreditCard className="h-3.5 w-3.5" />;
    }
  }; */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          z-[9999]
          w-[92vw] max-w-[600px] 
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
            <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
              <Receipt size={24} className="text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
                Payment Receipt
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                {isLoading
                  ? "Loading..."
                  : `#${receipt?.receiptNumber?.slice(-8) || "N/A"}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Generating Receipt...
              </p>
            </div>
          ) : receipt ? (
            <div className="p-6 space-y-6">
              {/* Institution Header */}
              <div className="text-center space-y-2 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {receipt.institutionDetails.name}
                </h2>
                <p className="text-[10px] font-medium text-slate-500 max-w-md mx-auto">
                  {receipt.institutionDetails.address}
                </p>
                <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {receipt.institutionDetails.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MailIcon className="h-3 w-3" />
                    {receipt.institutionDetails.email}
                  </span>
                </div>
                {receipt.institutionDetails.gstin && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-[8px] font-black"
                  >
                    GSTIN: {receipt.institutionDetails.gstin}
                  </Badge>
                )}
              </div>

              {/* Receipt Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    Receipt Number
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {receipt.receiptNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    Payment Date
                  </p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(receipt.paymentDate)}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Student Information
                </h3>
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">
                        {receipt.studentName}
                      </p>
                      <p className="text-[9px] font-medium text-slate-500">
                        ID: {receipt.studentId.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium text-slate-600">
                        {receipt.studentPhone}
                      </span>
                    </div>
                    {receipt.studentEmail && (
                      <div className="flex items-center gap-1.5">
                        <MailIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-600">
                          {receipt.studentEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Details */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Fee Breakdown
                </h3>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {getMonthName(receipt.month)} {receipt.year}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          Monthly Fee
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(receipt.baseFee)}
                      </span>
                    </div>
                    {receipt.dueCarriedForward > 0 && (
                      <div className="p-4 flex justify-between items-center bg-rose-50/50">
                        <div>
                          <p className="text-xs font-bold text-rose-700">
                            Previous Due
                          </p>
                          <p className="text-[9px] text-rose-600/70 mt-0.5">
                            Carried forward
                          </p>
                        </div>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(receipt.dueCarriedForward)}
                        </span>
                      </div>
                    )}
                    <div className="p-4 bg-slate-50 flex justify-between items-center">
                      <p className="text-xs font-black text-slate-700">
                        Total Amount
                      </p>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(receipt.amount)}
                      </span>
                    </div>
                    <div className="p-4 bg-emerald-50/50 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-emerald-700">
                          Amount Paid
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-white border-emerald-200 text-emerald-700 text-[8px] font-black"
                          >
                            {receipt.paymentMethod.replace("_", " ")}
                          </Badge>
                          {receipt.transactionId && (
                            <span className="text-[8px] font-medium text-slate-500">
                              ID: {receipt.transactionId.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-2xl font-black text-emerald-600">
                        {formatCurrency(receipt.paidAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {receipt.remarks && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Remarks
                  </p>
                  <p className="text-[11px] font-medium text-slate-600 italic">
                    "{receipt.remarks}"
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-[9px] font-bold text-emerald-700">
                      Verified Payment
                    </span>
                  </div>
                  <p className="text-[8px] font-medium text-slate-400">
                    Collected by: {receipt.collectedBy}
                  </p>
                </div>
                <p className="text-[8px] text-center text-slate-400">
                  This is a system generated receipt •{" "}
                  {receipt.receiptType === "FEE_PAYMENT"
                    ? "Fee Payment"
                    : "Advance Payment"}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="bg-amber-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Receipt Not Found
              </p>
              <p className="text-[10px] font-medium text-slate-500 max-w-xs mx-auto">
                The receipt for {getMonthName(month)} {year} could not be found
                or hasn't been generated yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {receipt && !isLoading && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="flex-1 rounded-2xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest h-11 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5 mr-2" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmail}
                disabled={isSendingEmail || sendEmailMutation.isPending}
                className="flex-1 rounded-2xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest h-11 hover:bg-slate-50"
              >
                {isSendingEmail || sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    Email
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={downloadReceiptMutation.isPending}
                className="flex-[2] rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white h-11 shadow-xl shadow-emerald-100 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
              >
                {downloadReceiptMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
