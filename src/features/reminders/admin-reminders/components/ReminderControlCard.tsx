import React from "react";
import { Play, Pause, Send, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminReminder } from "@/features/reminders/types/reminder.types";

interface Props {
  reminder: AdminReminder;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onTrigger: (id: string) => void;
  isActionLoading: boolean;
}

export const ReminderControlCard: React.FC<Props> = ({
  reminder,
  onPause,
  onResume,
  onTrigger,
  isActionLoading,
}) => {
  return (
    <div className="p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] bg-white border border-slate-100 hover:border-blue-100 transition-all group shadow-sm hover:shadow-md">
      {/* Header Section: Title & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
        <div className="flex gap-3 items-center min-w-0">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              reminder.isPaused
                ? "bg-slate-100 text-slate-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <BellRing size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate">
              {reminder.title}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">
              {reminder.type.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border-none ${
            reminder.isPaused
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${reminder.isPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`}
          />
          {reminder.isPaused ? "PAUSED" : "ACTIVE"}
        </Badge>
      </div>

      {/* Message Area */}
      <p className="text-[11px] sm:text-xs text-slate-500 mb-6 line-clamp-3 leading-relaxed font-medium min-h-[3em]">
        {reminder.message}
      </p>

      {/* Action Buttons: Responsive Grid */}
      <div className="flex flex-col xs:flex-row gap-2.5">
        {reminder.isPaused ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-11 sm:h-10 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
            onClick={() => onResume(reminder._id)}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Play size={14} className="mr-2" />
            )}
            Resume Node
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-11 sm:h-10 rounded-xl text-[10px] font-black uppercase tracking-wider text-rose-500 border-rose-50 hover:bg-rose-50 transition-all"
            onClick={() => onPause(reminder._id)}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Pause size={14} className="mr-2" />
            )}
            Stop Engine
          </Button>
        )}

        <Button
          size="sm"
          className="flex-1 h-11 sm:h-10 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95"
          onClick={() => onTrigger(reminder._id)}
          disabled={isActionLoading}
        >
          <Send size={14} className="mr-2" /> Force Sync
        </Button>
      </div>
    </div>
  );
};
