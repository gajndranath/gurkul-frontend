// frontend/src/features/admin/fees/components/cards/DueSummaryCards.tsx

import React from "react";
import {
  IndianRupee,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { DueSummaryStats } from "../../types/fee.types";

interface DueSummaryCardsProps {
  summary: DueSummaryStats;
  isLoading?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const DueSummaryCards: React.FC<DueSummaryCardsProps> = ({
  summary,
  isLoading = false,
  onViewAll,
  className = "",
}) => {
  // Loading State - 4 Skeletons
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="border-none ring-1 ring-slate-200 shadow-sm rounded-[20px] md:rounded-[24px] bg-white"
            >
              <CardContent className="p-4 md:p-6">
                <Skeleton className="h-4 w-16 md:w-20 mb-3 md:mb-4" />
                <Skeleton className="h-6 md:h-7 w-20 md:w-24 mb-1.5" />
                <Skeleton className="h-3 w-12 md:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default values if summary is undefined
  const safeSummary = {
    totalDueAmount: summary?.totalDueAmount || 0,
    totalDueStudents: summary?.totalDueStudents || 0,
    averageOverdueDays: summary?.averageOverdueDays || 0,
    criticalCount: summary?.criticalCount || 0,
    highCount: summary?.highCount || 0,
    mediumCount: summary?.mediumCount || 0,
    lowCount: summary?.lowCount || 0,
  };

  const cards = [
    {
      id: "total-overdue",
      title: "Total Overdue",
      value: formatCurrency(safeSummary.totalDueAmount),
      subtext: `${safeSummary.totalDueStudents} ${safeSummary.totalDueStudents === 1 ? "student" : "students"}`,
      mobileSubtext: `${safeSummary.totalDueStudents} std`,
      icon: <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      hoverColor: "hover:bg-rose-100",
      mobileIcon: <Users className="h-3 w-3" />,
    },
    {
      id: "avg-days",
      title: "Avg. Days",
      value: `${safeSummary.averageOverdueDays}d`,
      fullValue: `${safeSummary.averageOverdueDays} days`,
      subtext: "Average delay",
      mobileSubtext: "avg",
      icon: <Clock className="h-4 w-4 md:h-5 md:w-5" />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-100",
      hoverColor: "hover:bg-orange-100",
      mobileIcon: <Clock className="h-3 w-3" />,
    },
    {
      id: "critical",
      title: "Critical",
      value: safeSummary.criticalCount,
      subtext: `${safeSummary.criticalCount} ${safeSummary.criticalCount === 1 ? "student" : "students"} • 30+ days`,
      mobileSubtext: `30+ days`,
      icon: <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      hoverColor: "hover:bg-rose-100",
      mobileIcon: <Calendar className="h-3 w-3" />,
    },
    {
      id: "high-priority",
      title: "High Priority",
      value: safeSummary.highCount,
      subtext: `${safeSummary.highCount} ${safeSummary.highCount === 1 ? "student" : "students"} • 15-30 days`,
      mobileSubtext: `15-30d`,
      icon: <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      hoverColor: "hover:bg-amber-100",
      mobileIcon: <TrendingUp className="h-3 w-3" />,
    },
  ];

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Cards Grid - Fully Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`
              border-none ring-1 ring-slate-200 shadow-sm 
              rounded-[20px] md:rounded-[24px] bg-white 
              transition-all duration-200 hover:shadow-md 
              group/card active:scale-[0.98] cursor-default
            `}
          >
            <CardContent className="p-4 md:p-5 lg:p-6">
              {/* Header - Icon + Title */}
              <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                <div
                  className={`
                  p-1.5 md:p-2 lg:p-2.5 rounded-lg md:rounded-xl 
                  ${card.bgColor} ${card.textColor} 
                  transition-transform group-hover/card:scale-110
                `}
                >
                  {card.icon}
                </div>
                <span
                  className="
                  text-[8px] md:text-[9px] lg:text-[10px] 
                  font-black text-slate-400 
                  uppercase tracking-wider md:tracking-widest
                "
                >
                  {card.title}
                </span>
              </div>

              {/* Value */}
              <div
                className={`
                ${card.textColor} 
                text-lg sm:text-xl md:text-2xl lg:text-3xl 
                font-black tracking-tighter 
                mb-0.5 md:mb-1
              `}
              >
                {/* Desktop: Show full value */}
                <span className="hidden sm:inline">
                  {card.fullValue || card.value}
                </span>
                {/* Mobile: Show short value */}
                <span className="sm:hidden">{card.value}</span>
              </div>

              {/* Subtext - Responsive */}
              <div className="flex items-center gap-1 md:gap-1.5">
                {/* Mobile Icon */}
                <span className="sm:hidden text-slate-400">
                  {card.mobileIcon}
                </span>

                {/* Mobile Text */}
                <span className="sm:hidden text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  {card.mobileSubtext}
                </span>

                {/* Desktop Text */}
                <span className="hidden sm:inline text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {card.subtext}
                </span>
              </div>

              {/* Extra Info - Only for critical/high on desktop */}
              {card.id === "critical" && safeSummary.criticalCount > 0 && (
                <div className="hidden lg:block mt-3 pt-3 border-t border-dashed border-slate-100">
                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                    <span>Urgent action needed</span>
                    <AlertCircle className="h-3 w-3 text-rose-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button - Mobile & Tablet Only */}
      {onViewAll && (
        <div className="block lg:hidden">
          <Button
            variant="outline"
            onClick={onViewAll}
            className="
              w-full 
              rounded-2xl 
              border-slate-200 
              bg-white
              text-slate-600 
              font-black text-[10px] md:text-[11px]
              uppercase tracking-widest 
              h-11 md:h-12
              hover:bg-slate-900 hover:text-white 
              hover:border-slate-900
              transition-all duration-200
              active:scale-[0.98]
              shadow-sm hover:shadow-md
              group/btn
            "
          >
            <span>View All Due Records</span>
            <ArrowRight
              className="
              h-3.5 w-3.5 md:h-4 md:w-4 
              ml-2 
              transition-transform group-hover/btn:translate-x-1
            "
            />
          </Button>
        </div>
      )}

      {/* Quick Stats Row - Desktop Only */}
      <div className="hidden lg:flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Critical: {safeSummary.criticalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              High: {safeSummary.highCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Medium: {safeSummary.mediumCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Low: {safeSummary.lowCount}
            </span>
          </div>
        </div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
          Last updated:{" "}
          {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default DueSummaryCards;
