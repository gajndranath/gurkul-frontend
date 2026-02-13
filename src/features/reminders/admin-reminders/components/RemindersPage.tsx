import React from "react";
import {
  useReminders,
  useReminderActions,
} from "@/features/reminders/hook/useReminders";
import { reminderService } from "@/features/reminders/api/reminder.service";
import { useQuery } from "@tanstack/react-query";
import { DueSummaryHeader } from "@/features/reminders/admin-reminders/components/DueSummaryHeader";
import { ReminderControlCard } from "@/features/reminders/admin-reminders/components/ReminderControlCard";
import Loader from "@/components/Loader";

const RemindersPage: React.FC = () => {
  const { data: reminders, isLoading: remLoading } = useReminders();
  const { pauseReminder, resumeReminder, triggerReminder, isActionLoading } =
    useReminderActions();

  // Fetching live summary for the current month
  const today = new Date();
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["due-summary", today.getMonth(), today.getFullYear()],
    queryFn: () =>
      reminderService.getDueSummary(today.getMonth(), today.getFullYear()),
  });

  if (remLoading && !reminders) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
          Reminders Engine<span className="text-blue-600">.</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
          Automated Operational Node Management
        </p>
      </header>

      <DueSummaryHeader summary={summary} isLoading={sumLoading} />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Active Automated Jobs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders?.map((reminder) => (
            <ReminderControlCard
              key={reminder._id}
              reminder={reminder}
              onPause={(id) =>
                pauseReminder({ id, reason: "Manual Pause by Admin" })
              }
              onResume={resumeReminder}
              onTrigger={triggerReminder}
              isActionLoading={isActionLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default RemindersPage;
