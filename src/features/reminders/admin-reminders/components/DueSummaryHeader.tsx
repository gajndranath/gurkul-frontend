import React from "react";
import { IndianRupee, Users, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DueSummary } from "@/features/reminders/types/reminder.types";

interface DueSummaryHeaderProps {
  summary?: DueSummary;
  isLoading: boolean;
}

export const DueSummaryHeader: React.FC<DueSummaryHeaderProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 sm:h-28 w-full animate-pulse bg-slate-100 rounded-[32px]"
          />
        ))}
      </div>
    );

  const stats = [
    {
      label: "Total Dues Detected",
      value: `₹${summary?.totalDueAmount?.toLocaleString() || 0}`,
      icon: <IndianRupee className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
    },
    {
      label: "Defaulter Students",
      value: summary?.totalDueStudents || 0,
      icon: <Users className="text-amber-600" size={20} />,
      bgColor: "bg-amber-50",
    },
    {
      label: "Node Status",
      value: "Active",
      icon: <AlertCircle className="text-emerald-600" size={20} />,
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className={`
            p-6 sm:p-6 rounded-[32px] border-none shadow-sm bg-white 
            flex flex-col sm:flex-row items-center sm:items-center 
            text-center sm:text-left
            gap-4 sm:gap-5 transition-transform active:scale-[0.98]
            ${i === 2 ? "sm:col-span-2 md:col-span-1" : ""}
          `}
        >
          {/* Icon Container - Centered on Mobile */}
          <div
            className={`h-12 w-12 ${stat.bgColor} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}
          >
            {stat.icon}
          </div>

          {/* Text Container - Centered on Mobile */}
          <div className="min-w-0 flex flex-col items-center sm:items-start">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">
              {stat.label}
            </p>
            <p className="text-xl sm:text-xl font-black text-slate-900 tracking-tight">
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
