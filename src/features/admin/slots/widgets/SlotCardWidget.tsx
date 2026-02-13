import React, { memo, useMemo, useState } from "react";
import {
  Clock,
  Edit3,
  MoreVertical,
  IndianRupee,
  Users2,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Badge,
} from "../../../../components/ui";
import { usePrefetchSlot } from "../hooks/usePrefetchSlot";
import { calculateDuration } from "../../../../lib/utils";
import type { Slot } from "../types/slot.types";
import SlotDetailWidget from "../widgets/SlotDetailWidget";

interface SlotCardProps {
  slot: Slot;
}

const SlotCardWidget: React.FC<SlotCardProps> = memo(({ slot }) => {
  const [showDetails, setShowDetails] = useState(false);
  const prefetchSlot = usePrefetchSlot();

  const duration = useMemo(
    () => calculateDuration(slot.timeRange.start, slot.timeRange.end),
    [slot.timeRange],
  );

  const occupancy = slot.occupancyPercentage ?? 0;
  const isCritical = occupancy >= 90;
  const isFull = occupancy >= 100;

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <>
      <div
        onMouseEnter={() => slot._id && prefetchSlot(slot._id)}
        className="group h-full"
      >
        <Card
          onClick={handleOpenDetails}
          className={`h-full cursor-pointer transition-all duration-500 relative overflow-hidden border-slate-200 shadow-sm rounded-[28px] bg-white hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-2 hover:border-blue-300 ${isCritical ? "hover:shadow-rose-100/50 hover:border-rose-200" : ""}`}
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-700" />
          <CardContent className="p-6 flex flex-col h-full relative z-10">
            <div className="flex justify-between items-start mb-6 text-left">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[140px]">
                    {slot.name}
                  </h3>
                  <Badge
                    className={`text-[8px] px-2 py-0.5 rounded-full font-black border-none tracking-widest ${isFull ? "bg-rose-100 text-rose-600" : isCritical ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {isFull ? "FULL" : isCritical ? "LIMITED" : "OPEN"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase bg-slate-50/80 px-2.5 py-1.5 rounded-xl ring-1 ring-slate-100 w-fit">
                  <Clock size={12} className="text-blue-600" />
                  <span>
                    {slot.timeRange.start} — {slot.timeRange.end}
                  </span>
                  <span className="text-blue-400">({duration})</span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-2xl p-1.5 border-slate-100 shadow-2xl ring-1 ring-black/5"
                  >
                    <DropdownMenuItem className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5 text-slate-600 focus:text-blue-600 focus:bg-blue-50">
                      <Edit3 size={16} /> Edit Configuration
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1 text-left">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users2 size={11} className="text-blue-500" /> Density
                  </p>
                  <p className="text-base font-black text-slate-900 tracking-tight">
                    {slot.occupiedSeats}{" "}
                    <span className="text-slate-300 font-bold text-sm">
                      / {slot.totalSeats}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-black tracking-tighter ${isCritical ? "text-rose-600" : "text-blue-600"}`}
                  >
                    {occupancy}%
                  </p>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner ring-1 ring-slate-200/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isCritical ? "bg-rose-500 shadow-rose-200" : "bg-blue-600 shadow-blue-200"}`}
                  style={{ width: `${Math.min(occupancy, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-5 border-t border-slate-50 flex justify-between items-center bg-gradient-to-b from-white to-slate-50/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-[28px]">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Premium Plan
                </p>
                <div className="text-slate-900 font-black text-lg flex items-center tracking-tighter leading-none">
                  <IndianRupee size={15} className="text-blue-600" />
                  {slot.monthlyFee?.toLocaleString()}
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenDetails}
                className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 flex gap-2 active:scale-95"
              >
                Details <ArrowUpRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDetails && (
        <SlotDetailWidget
          slotId={slot._id!} // CORRECTED PROP NAME HERE
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
});

SlotCardWidget.displayName = "SlotCardWidget";
export default SlotCardWidget;
