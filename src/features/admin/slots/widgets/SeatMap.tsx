import React from "react";
import type { Seat } from "../hooks/useSeatChart";
import { useSeatChart } from "../hooks/useSeatChart";
import { Loader2, Armchair, Info, Target, User, ShieldAlert } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";

interface SeatMapProps {
  slotId: string;
  onSeatSelect?: (seatNumber: string) => void;
  selectedSeat?: string;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  slotId,
  onSeatSelect,
  selectedSeat,
}) => {
  const { data, isLoading, isError } = useSeatChart(slotId);

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
      return "bg-slate-100 text-slate-400 border-none cursor-not-allowed opacity-80 grayscale";
    
    if (seat.status === "BLOCKED_BY_FULL_DAY") 
      return "bg-amber-50 text-amber-500 border-2 border-amber-100/50 cursor-not-allowed shadow-inner";
    
    return "bg-white text-emerald-600 border-[3px] border-emerald-50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm active:scale-90";
  };

  return (
    <div className="space-y-10">
      {/* Header Info & Legend */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
              {data.slotName}
            </Badge>
            <span className="text-slate-300 font-black">/</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{data.roomName}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Spatial <span className="text-blue-600">Density</span>
            </h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Target size={12} className="text-blue-500" /> Authorized Capacity: {data.totalSeats} Nodes
          </p>
        </div>

        {/* High-Fidelity Legend */}
        <div className="flex gap-1.5 p-1.5 bg-slate-100/50 rounded-[24px] border border-slate-200/50 backdrop-blur-sm self-end">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight whitespace-nowrap">Vacant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight whitespace-nowrap">Occupied</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight whitespace-nowrap">Blocked</span>
          </div>
        </div>
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 p-8 bg-slate-50/50 rounded-[48px] border-4 border-white shadow-inner relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 blur-[100px] pointer-events-none" />
        
        {data.seats.map((seat) => (
          <Popover key={seat.seatNumber}>
            <PopoverTrigger asChild>
              <div
                onClick={() => {
                  if (seat.status === "VACANT" && onSeatSelect) {
                    onSeatSelect(seat.seatNumber);
                  }
                }}
                className={cn(
                  "relative aspect-square flex flex-col items-center justify-center rounded-[24px] font-black text-sm transition-all duration-300 group",
                  getSeatStyles(seat)
                )}
              >
                <Armchair size={18} className={cn(
                  "mb-1 transition-transform group-hover:scale-110",
                  seat.status === "VACANT" ? "opacity-30" : "opacity-60"
                )} />
                <span className="tracking-tighter">{seat.seatNumber}</span>
                
                {/* Visual Indicators for specific states */}
                {seat.status === "OCCUPIED" && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
                {seat.status === "BLOCKED_BY_FULL_DAY" && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>
            </PopoverTrigger>
            
            <PopoverContent 
              side="top" 
              className="w-56 bg-slate-900 border-none rounded-[28px] p-5 shadow-2xl animate-in zoom-in-95 data-[side=top]:slide-in-from-bottom-2 duration-200"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-2.5 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">
                    Node {seat.seatNumber}
                  </p>
                  <Badge variant="ghost" className="text-[9px] font-black uppercase text-white px-2 py-0 border border-white/20">
                    ID-CORE
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 pl-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    seat.status === "VACANT" ? "bg-emerald-500/20 text-emerald-400" :
                    seat.status === "OCCUPIED" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {seat.status === "VACANT" ? <Target size={18} /> : 
                     seat.status === "OCCUPIED" ? <User size={18} /> : <ShieldAlert size={18} />}
                  </div>
                  <div>
                    <span className="text-white text-sm font-black tracking-tight leading-none block mb-0.5">
                      {seat.status === "VACANT" ? "System Available" : 
                       seat.status === "OCCUPIED" ? seat.studentName : "Space Reserved"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {seat.status === "VACANT" ? "Open for link" : "Authentication Active"}
                    </span>
                  </div>
                </div>

                {seat.status === "BLOCKED_BY_FULL_DAY" && (
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-[9px] text-amber-300 font-bold italic leading-relaxed">
                      LOCKED BY: {seat.studentName} (Global Priority)
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      {/* Contextual Intelligence */}
      <div className="p-6 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite] pointer-events-none" />
        <div className="flex gap-4 items-center relative z-10">
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Info size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Infrastructure Logic Insight</p>
            <p className="text-xs font-bold text-white leading-relaxed max-w-2xl">
              Real-time synchronization active. Amber nodes represent "Global Priority" cross-lockings from Full Day shifts. Interact with a node to deploy user assignment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

