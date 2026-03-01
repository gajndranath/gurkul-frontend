import React, { useState, useMemo } from "react";
import { 
  Layers, 
  ShieldCheck, 
  Loader2, 
  Target, 
  Map as MapIcon,
  Filter
} from "lucide-react";
import { useRooms } from "../rooms/hooks/useRooms";
import { useSlots } from "../slots/hooks/useSlots";
import { SeatMap } from "../slots/widgets/SeatMap";
import SeatAssignmentModal from "./widgets/SeatAssignmentModal";
import {
  Card,
  CardContent,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const InteractiveMapPage: React.FC = () => {
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { slots, isLoading: slotsLoading } = useSlots();
  
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [assigningSeat, setAssigningSeat] = useState<{ seatNumber: string; slotId: string; slotName: string } | null>(null);

  // Initialize selections once data is loaded
  React.useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0]._id);
    }
  }, [rooms, selectedRoomId]);

  // 2. Compute Filtered Slots (Pure Memo)
  const filteredSlots = useMemo(() => {
    if (!selectedRoomId || !slots) return [];
    return slots.filter((s: any) => {
      const slotRoomId = typeof s.roomId === 'object' ? s.roomId?._id : s.roomId;
      return slotRoomId === selectedRoomId;
    });
  }, [selectedRoomId, slots]);


  // 3. Auto-select slot logic (Safe Effect)
  React.useEffect(() => {
    if (filteredSlots.length > 0) {
      const currentSlotExists = filteredSlots.find((s: any) => s._id === selectedSlotId);
      if (!selectedSlotId || !currentSlotExists) {
        setSelectedSlotId(filteredSlots[0]._id);
      }
    } else {
        setSelectedSlotId(""); // Reset if no slots available
    }
  }, [filteredSlots, selectedSlotId]);

  const isLoading = roomsLoading || slotsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Spatial Registry...</p>
      </div>
    );
  }

  const currentRoom = rooms?.find(r => r._id === selectedRoomId);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10">
      {/* Header Nucleus */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
               <MapIcon size={18} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
              Control <span className="text-blue-600">Center</span>
            </h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] max-w-xl leading-relaxed">
            Execute real-time spatial management. Deploy members to nodes, monitor density, and synchronize shifts across the unified registry.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none h-14 rounded-2xl border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
             <Filter size={14} className="mr-2" /> Global Filter
          </Button>
          <Button className="flex-1 lg:flex-none h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">
             <Target size={14} className="mr-2" /> Quick Assign
          </Button>
        </div>
      </div>

      {/* Control Strip */}
      <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden p-1 ring-1 ring-slate-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Room Selector */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Physical Hall</label>
              <Select 
                modal={false}
                value={selectedRoomId} 
                onValueChange={setSelectedRoomId}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-xs uppercase italic tracking-tight focus:ring-2 focus:ring-blue-600/10">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent position="popper" className="rounded-2xl border-slate-100 shadow-2xl">
                  {rooms?.map(room => (
                    <SelectItem key={room._id} value={room._id} className="text-xs font-black uppercase tracking-tight py-3 italic">
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slot Selector */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Shift Context</label>
              <Select 
                modal={false}
                value={selectedSlotId} 
                onValueChange={setSelectedSlotId}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-xs uppercase italic tracking-tight focus:ring-2 focus:ring-blue-600/10">
                  <SelectValue placeholder="Select Slot" />
                </SelectTrigger>
                <SelectContent position="popper" className="rounded-2xl border-slate-100 shadow-2xl">
                  {filteredSlots.map((slot: any) => (
                    <SelectItem key={slot._id} value={slot._id} className="text-xs font-black uppercase tracking-tight py-3 italic">
                      {slot.name} ({slot.timeRange.start} - {slot.timeRange.end})
                    </SelectItem>
                  ))}
                  {filteredSlots.length === 0 && (
                    <SelectItem value="none" disabled className="text-[10px] font-black uppercase py-4 text-slate-400">
                      No shifts defined for this hall
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Room Stats */}
            <div className="hidden lg:flex flex-col justify-center items-end col-span-2 border-l border-slate-100 pl-8">
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase">Global Capacity</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">{currentRoom?.totalSeats || 0} Nodes</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                     <Layers size={20} />
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Hub */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-8 min-h-[500px] relative overflow-hidden group">
        {/* Shimmer Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(110deg,transparent_25%,rgba(59,130,246,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_infinite] pointer-events-none" />
        
        {selectedSlotId && selectedSlotId !== "none" ? (
          <SeatMap 
            slotId={selectedSlotId} 
            onSeatSelect={(seat) => setAssigningSeat({ 
              seatNumber: seat.seatNumber, 
              slotId: selectedSlotId, 
              slotName: filteredSlots.find((s: any) => s._id === selectedSlotId)?.name || "" 
            })} 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Target size={64} className="text-slate-100 mb-6" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Awaiting Spatial Input</h3>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-tighter mt-2 max-w-sm italic">
              Please select a valid hall and shift context from the Control Strip above to deploy the interactive map.
            </p>
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="flex items-center justify-between px-8 py-6 bg-slate-900 rounded-[32px] text-white">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 leading-none">Telemetry Status</p>
              <p className="text-xs font-black uppercase tracking-tight">Active Real-time Synchronization Enabled</p>
           </div>
        </div>
        <div className="hidden md:block">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">System Architecture v4.0.2</p>
        </div>
      </div>

      {/* SEAT ASSIGNMENT MODAL */}
      {assigningSeat && (
        <SeatAssignmentModal
          isOpen={!!assigningSeat}
          onClose={() => setAssigningSeat(null)}
          slotId={assigningSeat.slotId}
          seatNumber={assigningSeat.seatNumber}
          slotName={assigningSeat.slotName}
        />
      )}
    </div>
  );
};

export default InteractiveMapPage;
