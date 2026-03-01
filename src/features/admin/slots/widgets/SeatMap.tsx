import React from "react";
import type { Seat } from "../hooks/useSeatChart";
import { useSeatChart } from "../hooks/useSeatChart";
import { Loader2, Armchair, Info, Target, User, ShieldAlert } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";

interface SeatMapProps {
  slotId: string;
  onSeatSelect?: (seat: Seat) => void;
  selectedSeat?: string;
  onCloseMap?: () => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  slotId,
  onSeatSelect,
  selectedSeat,
  onCloseMap,
}) => {
  const { data, isLoading, isError } = useSeatChart(slotId);
  const { openEntityDrawer } = useUIStore();
  const [activePopover, setActivePopover] = React.useState<string | null>(null);

  const handleHandover = (student: any) => {
    // 0. Close the popover immediately
    setActivePopover(null);
    
    // 1. Close the current map drawer first
    onCloseMap?.();
    
    // 2. Short delay to allow the map drawer to initiate its exit before profile enters
    setTimeout(() => {
      openEntityDrawer(student);
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-6" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
          Mapping Spatial Occupancy...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-rose-50/50 rounded-[40px] border border-rose-100 flex flex-col items-center">
        <ShieldAlert className="h-10 w-10 text-rose-500 mb-4" />
        <p className="text-rose-600 font-black uppercase text-xs tracking-widest">Critical: Telemetry Failure</p>
        <p className="text-rose-400 text-[10px] font-bold mt-2">Could not synchronize seat data for this shift.</p>
      </div>
    );
  }

  const getSeatStyles = (seat: Seat) => {
    const isSelected = selectedSeat === seat.seatNumber;
    
    if (isSelected) return "bg-blue-600 text-white shadow-2xl shadow-blue-400 ring-[6px] ring-blue-100 scale-105 z-20 border-transparent";
    
    if (seat.status === "OCCUPIED") 
      return "bg-slate-100 text-slate-400 border-none cursor-not-allowed opacity-80 grayscale hover:bg-slate-200 transition-colors";
    
    if (seat.status === "BLOCKED_BY_FULL_DAY") 
      return "bg-amber-50 text-amber-500 border-2 border-amber-100/50 cursor-not-allowed shadow-inner";
    
    return "bg-white text-emerald-600 border-[3px] border-emerald-50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer shadow-sm active:scale-95";
  };

  const vacantCount = data.seats.filter(s => s.status === "VACANT").length;
  const occupiedCount = data.seats.filter(s => s.status === "OCCUPIED" || s.status === "BLOCKED_BY_FULL_DAY").length;

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {/* Dynamic Header & Legend */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Spatial Intelligence Active</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {data.roomName} <span className="text-slate-300">/</span> <span className="text-blue-600 italic">{data.slotName}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <Target size={12} className="text-blue-500" /> Capacity: {data.totalSeats}
             </div>
             <Separator orientation="vertical" className="h-3 bg-slate-200" />
             <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {vacantCount} Available
             </div>
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm shadow-sm overflow-x-auto max-w-full no-scrollbar">
          {[
            { label: "Open", color: "bg-emerald-500" },
            { label: "Full", color: "bg-slate-400" },
            { label: "Locked", color: "bg-amber-400" }
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 whitespace-nowrap">
              <div className={cn("w-2 h-2 rounded-full", l.color)} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative group/canvas">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="bg-white rounded-[40px] sm:rounded-[56px] border border-slate-100 shadow-2xl shadow-blue-100/20 p-4 sm:p-10 relative overflow-hidden ring-4 ring-slate-50">
          {/* Canvas Accent */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-5 relative z-10">
            {data.seats.map((seat) => (
              <Popover 
                key={seat.seatNumber} 
                open={activePopover === seat.seatNumber} 
                onOpenChange={(open) => setActivePopover(open ? seat.seatNumber : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      if (seat.status === "VACANT" && onSeatSelect) {
                        onSeatSelect(seat);
                      }
                    }}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-[20px] sm:rounded-[28px] font-black text-[10px] sm:text-xs transition-all duration-500 group outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 z-0 hover:z-10 disabled:cursor-not-allowed",
                      getSeatStyles(seat)
                    )}
                  >
                    <Armchair size={16} className={cn(
                      "mb-0.5 sm:mb-1 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6",
                      seat.status === "VACANT" ? "opacity-20" : "opacity-60"
                    )} />
                    <span className="tracking-tighter uppercase">{seat.seatNumber}</span>
                    
                    {/* Interaction Glow */}
                    <div className="absolute inset-0 rounded-[20px] sm:rounded-[28px] bg-blue-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity animate-pulse" />
                  </button>
                </PopoverTrigger>
                
                <PopoverContent 
                  side="top" 
                  align="center"
                  className="w-52 bg-slate-900 border-none rounded-[28px] p-5 shadow-2xl animate-in zoom-in-95 fade-in duration-200 z-[200]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1">
                        Node {seat.seatNumber}
                      </p>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        seat.status === "VACANT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        seat.status === "OCCUPIED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {seat.status === "VACANT" ? <Target size={18} /> : 
                         seat.status === "OCCUPIED" ? <User size={18} /> : <ShieldAlert size={18} />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-white text-[11px] font-black tracking-tight leading-none block mb-1 uppercase truncate">
                          {seat.status === "VACANT" ? "Idle Node" : 
                           seat.status === "OCCUPIED" ? seat.studentName : "Reserved"}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.15em] block">
                          {seat.status === "VACANT" ? "Available now" : "Registry Linked"}
                        </span>
                      </div>
                    </div>

                    {seat.status !== "VACANT" && (
                       <Button 
                        size="sm"
                        className="w-full h-8 bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest"
                        onClick={() => seat.studentId && handleHandover({ _id: seat.studentId, name: seat.studentName, seatNumber: seat.seatNumber })}
                       >
                         View Identity
                       </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligence Summary Bar */}
      <footer className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-6 sm:p-8 bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Info size={24} className="text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Utilization Insight</p>
            <p className="text-[11px] font-bold text-slate-300 leading-tight">
              Hover over architecture nodes for status telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10 bg-white/5 p-3 rounded-2xl border border-white/10">
           <div className="text-center">
              <p className="text-xl font-black text-white italic leading-none">{vacantCount}</p>
              <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mt-1">Vacant</p>
           </div>
           <Separator orientation="vertical" className="h-6 bg-white/10" />
           <div className="text-center">
              <p className="text-xl font-black text-white italic leading-none">{occupiedCount}</p>
              <p className="text-[7px] font-black text-rose-400 uppercase tracking-widest mt-1">Occupied</p>
           </div>
           <Separator orientation="vertical" className="h-6 bg-white/10" />
           <div className="text-center">
              <p className="text-xl font-black text-blue-400 italic leading-none">{Math.round((occupiedCount / data.totalSeats) * 100)}%</p>
              <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mt-1">Yield</p>
           </div>
        </div>
      </footer>
    </div>
  );
};
