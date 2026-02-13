// frontend/src/features/admin/fees/components/modals/SendReminderModal.tsx

import React, { useState } from "react";
import {
  X,
  Bell,
  Mail,
  Phone,
  Send,
  Smartphone,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { notificationService } from "@/features/notifications/api/notification.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatFeeMonth } from "@/features/admin/fees/lib/feeUtils";
import type { DueRecord } from "@/features/admin/fees/types/fee.types";

type ChannelType = "email" | "sms" | "push" | "in-app";

interface SendReminderModalProps {
  record: DueRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SendReminderModal: React.FC<SendReminderModalProps> = ({
  record,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([
    "email",
  ]);
  const [message, setMessage] = useState(
    `Dear ${record.studentName}, your fee of ${formatCurrency(
      record.totalAmount,
    )} for ${formatFeeMonth(record.month, record.year)} is overdue by ${
      record.daysOverdue
    } days. Please clear your dues at the earliest to avoid service interruption.`,
  );
  const [isSending, setIsSending] = useState(false);

  const channels: { id: ChannelType; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "email",
        label: "Email",
        icon: <Mail className="h-4 w-4" />,
      },
      {
        id: "sms",
        label: "SMS",
        icon: <Phone className="h-4 w-4" />,
      },
      {
        id: "push",
        label: "Push",
        icon: <Smartphone className="h-4 w-4" />,
      },
      {
        id: "in-app",
        label: "In-App",
        icon: <Bell className="h-4 w-4" />,
      },
    ];

  const toggleChannel = (channel: ChannelType) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const handleSendReminder = async () => {
    if (selectedChannels.length === 0) {
      toast.error("Error", "Please select at least one notification channel");
      return;
    }

    setIsSending(true);

    try {
      // Send to each selected channel
      const promises = selectedChannels.map((channel) =>
        notificationService.sendToStudent({
          studentId: record.studentId,
          channel,
          title: "Fee Payment Reminder",
          message: message,
        }),
      );

      await Promise.all(promises);

      toast.success(
        "Success",
        `Reminder sent via ${selectedChannels.length} channel(s)`,
      );
      onSuccess?.();
      onClose();
    } catch {
      // ✅ FIX: Removed unused 'error' variable
      toast.error("Error", "Failed to send reminder. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
        z-[9999]
        w-[92vw] max-w-[500px] 
        rounded-[32px] p-0 overflow-hidden 
        border-none shadow-2xl bg-white outline-none 
        [&>button]:hidden
        max-h-[90vh] overflow-y-auto custom-scrollbar
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
            <div className="h-10 w-10 bg-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-100">
              <Bell size={20} className="text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
                Send Reminder<span className="text-amber-600">.</span>
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                {record.studentName} •{" "}
                {formatFeeMonth(record.month, record.year)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Student Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {record.studentName}
                  </p>
                  <p className="text-[9px] font-medium text-slate-500">
                    ID: {record.studentId.slice(-8)}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`
                  rounded-lg px-2 py-0.5 text-[9px] font-black uppercase
                  ${record.daysOverdue > 30 ? "bg-rose-50 text-rose-600 border-rose-200" : ""}
                  ${record.daysOverdue > 15 && record.daysOverdue <= 30 ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                  ${record.daysOverdue > 7 && record.daysOverdue <= 15 ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
                  ${record.daysOverdue <= 7 ? "bg-slate-50 text-slate-600 border-slate-200" : ""}
                `}
              >
                {record.daysOverdue}d overdue
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="font-medium text-slate-500">Amount:</span>
                <span className="ml-2 font-black text-rose-600">
                  {formatCurrency(record.totalAmount)}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Due Date:</span>
                <span className="ml-2 font-bold text-slate-700">
                  {formatDate(record.dueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Notification Channels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => toggleChannel(channel.id)}
                  className={`
                    flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 relative
                    ${
                      selectedChannels.includes(channel.id)
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm shadow-blue-100"
                        : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                    }
                  `}
                >
                  {channel.icon}
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {channel.label}
                  </span>
                  {selectedChannels.includes(channel.id) && (
                    <CheckCircle className="h-3 w-3 text-blue-600 absolute top-1 right-1" />
                  )}
                </button>
              ))}
            </div>
            {selectedChannels.length === 0 && (
              <p className="text-[9px] font-medium text-rose-500 ml-1">
                Select at least one channel
              </p>
            )}
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Reminder Message
              </label>
              <span className="text-[8px] font-medium text-slate-400">
                {message.length}/500
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              className="min-h-[120px] rounded-2xl border-none bg-slate-50 p-4 text-xs font-medium resize-none focus-visible:ring-2 focus-visible:ring-blue-600"
              placeholder="Enter custom reminder message..."
            />
          </div>

          {/* Warning for high urgency */}
          {record.urgency === "critical" && (
            <div className="p-4 bg-rose-50 rounded-2xl flex gap-3 items-start border border-rose-100">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-rose-700 font-bold leading-relaxed">
                <p className="font-black uppercase tracking-wider">
                  Critical Overdue
                </p>
                <p className="mt-1 text-rose-600/80 font-medium">
                  This payment is over 30 days overdue. Immediate action
                  required.
                </p>
              </div>
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest h-12 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendReminder}
              disabled={isSending || selectedChannels.length === 0}
              className="flex-[2] rounded-2xl font-black bg-amber-600 hover:bg-amber-700 text-white h-12 shadow-xl shadow-amber-100 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendReminderModal;
