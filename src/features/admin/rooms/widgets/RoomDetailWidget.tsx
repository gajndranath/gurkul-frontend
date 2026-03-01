import React, { memo, useMemo } from "react";
import { 
  X, 
  Home, 
  Users2, 
  Activity, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react";
import { 
  Button, 
  Badge 
} from "../../../../components/ui";
import { Separator } from "@/components/ui/separator";
import type { Room } from "../types/room.types";
import { useSlots } from "../../slots/hooks/useSlots";

interface RoomDetailWidgetProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomDetailWidget: React.FC<RoomDetailWidgetProps> = memo(({
  room,
  isOpen,
  onClose
}) => {
  const { slots, isLoading } = useSlots();
  
  const roomSlots = useMemo(() => 
    (slots || []).filter(s => s.roomId === room?._id),
  [slots, room?._id]);

  const stats = useMemo(() => {
    if (!room) return null;
    const totalSlots = roomSlots.length;
    const totalCapacity = room.totalSeats;
    const avgOccupancy = roomSlots.length > 0
      ? Math.round(roomSlots.reduce((acc, s) => acc + (s.occupancyPercentage || 0), 0) / roomSlots.length)
      : 0;
    
    return { totalSlots, totalCapacity, avgOccupancy };
  }, [room, roomSlots]);

  // if (!room) return null; // MOVED DOWN TO ALLOW ANIMATION

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      <aside
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[500px] bg-slate-50 z-[121] shadow-2xl 
          transition-transform duration-500 ease-in-out border-l border-white/20
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {!room ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Node Selection...</p>
          </div>
        ) : (
          <>
        <header className="p-6 sm:p-8 bg-white border-b border-slate-100 relative overflow-hidden shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors z-[60]"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
             <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] sm:rounded-[28px] bg-slate-900 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xl italic border-4 border-white shrink-0">
                {room.name?.charAt(0) || "H"}
             </div>
             
             <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                   <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase">{room.name}</h2>
                   <Badge variant="outline" className={`text-[10px] font-black uppercase ${room.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                     {room.isActive ? "Operational" : "Offline"}
                   </Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node ID: {room._id?.slice(-8).toUpperCase()}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                   <div className="flex items-center gap-1.5 p-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Users2 size={12} className="text-blue-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">{room.totalSeats} Nodes</span>
                   </div>
                   <div className="flex items-center gap-1.5 p-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Layers size={12} className="text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">{roomSlots.length} Shifts</span>
                   </div>
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 group hover:border-blue-500 transition-all cursor-default text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Density</p>
                 {isLoading ? (
                    <div className="h-8 bg-slate-50 rounded-lg animate-pulse w-2/3" />
                 ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-slate-900 italic">{stats?.avgOccupancy}%</p>
                      <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-blue-600" style={{ width: `${stats?.avgOccupancy}%` }} />
                    </div>
                  </>
                 )}
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 group hover:border-indigo-500 transition-all cursor-default text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Shifts</p>
                 {isLoading ? (
                    <div className="h-8 bg-slate-50 rounded-lg animate-pulse w-1/2" />
                 ) : (
                   <>
                    <p className="text-3xl font-black text-indigo-600 italic leading-none">{stats?.totalSlots}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Operational Pulse</p>
                   </>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 pb-2">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Activity size={14} className="text-blue-500" /> Linked Shifts Hierarchy
                 </h3>
                 <Separator className="bg-slate-50" />
              </div>
              
              <div className="p-6 pt-0 space-y-3">
                 {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                    ))
                 ) : roomSlots.length > 0 ? (
                   roomSlots.map((slot) => (
                     <div key={slot._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="text-left">
                           <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{slot.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {slot.timeRange.start} — {slot.timeRange.end}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-[11px] font-black text-slate-900">{slot.occupancyPercentage}%</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Density</p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 flex flex-col items-center justify-center opacity-30 italic">
                      <Layers size={32} className="text-slate-200 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Shifts Linked</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Home size={14} className="text-amber-500" /> Space Specifications
              </h3>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                 <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                    {room.description || "The architectural parameters for this node have not been documented."}
                 </p>
              </div>
           </div>
        </div>

        <footer className="p-6 sm:p-8 bg-white border-t border-slate-100 flex gap-4 shrink-0 mt-auto">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                 <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Verification</p>
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight">Spatial Data Secure</p>
              </div>
           </div>
           <Button 
            className="ml-auto rounded-2xl h-14 px-12 bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200"
            onClick={onClose}
          >
            </Button>
          </footer>
          </>
        )}
      </aside>
    </>
  );
});

RoomDetailWidget.displayName = "RoomDetailWidget";
