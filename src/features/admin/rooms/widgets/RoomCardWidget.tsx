import React, { memo, useMemo } from "react";
import {
  Home,
  Users2,
  Trash2,
  Edit3,
  MoreVertical,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { useSlots } from "../../slots/hooks/useSlots"; // To show child slot count
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
import type { Room } from "../types/room.types";

interface RoomCardProps {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void; // New prop for drawer
}

const RoomCardWidget: React.FC<RoomCardProps> = memo(({ room, onEdit, onDelete, onViewDetails }) => {
  const { slots } = useSlots();
  
  const roomSlots = useMemo(() => 
    (slots || []).filter(s => s.roomId === room._id),
  [slots, room._id]);

  return (
    <div className="group h-full">
      <Card
        onClick={onViewDetails}
        className="h-full cursor-pointer transition-all duration-500 relative overflow-hidden border-slate-100 shadow-sm rounded-[32px] bg-white group hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-2 hover:ring-1 hover:ring-blue-100"
      >
        {/* Animated Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-600/0 to-blue-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
        
        <CardContent className="p-6 flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-6 text-left">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[140px]">
                  {room.name}
                </h3>
                <Badge
                  className={`text-[8px] px-2 py-0.5 rounded-full font-black border-none tracking-widest ${room.isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                >
                  {room.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase bg-slate-50/80 px-2.5 py-1.5 rounded-xl ring-1 ring-slate-100 w-fit">
                <Home size={12} className="text-blue-600" />
                <span>Physical Hall</span>
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
                  <DropdownMenuItem
                    className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5 text-slate-600 focus:text-blue-600 focus:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                  >
                    <Edit3 size={16} /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5 text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                  >
                    <Trash2 size={16} /> Delete Space
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1 text-left">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users2 size={11} className="text-blue-500" /> Capacity
              </p>
            <div className="flex items-end justify-between gap-2">
               <div className="space-y-1">
                 <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                   {room.totalSeats}
                 </p>
                 <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block">
                   Node Capacity
                 </span>
               </div>
               <div className="text-right space-y-1">
                 <p className="text-lg font-black text-blue-600 tracking-tight leading-none">
                   {roomSlots.length}
                 </p>
                 <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block">
                    Active Shifts
                 </span>
               </div>
            </div>
          </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Info size={10} className="text-blue-400" /> Observations
              </p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                {room.description || "No specific configuration info provided for this room."}
              </p>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-50 flex justify-between items-center bg-gradient-to-b from-white to-slate-50/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-[28px]">
            <div className="text-left">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Status Architecture
              </p>
              <div className="text-slate-900 font-black text-sm flex items-center tracking-tighter leading-none uppercase">
                {room.isActive ? "Verified Operational" : "System Deactivated"}
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={onEdit}
              className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200 flex gap-2 active:scale-95 transition-all"
            >
              Configure <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

RoomCardWidget.displayName = "RoomCardWidget";
export default RoomCardWidget;
