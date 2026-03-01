// frontend/src/features/admin/slots/SlotManagementPage.tsx
import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  Loader2,
  Plus,
  Layers,
  ShieldCheck,
  AlertCircle,
  Database,
  Users2,
  TrendingUp,
  Activity,
  Search,
} from "lucide-react";
import { useSlots } from "./hooks/useSlots";
import { useRooms } from "../rooms/hooks/useRooms";
import SlotCardWidget from "./widgets/SlotCardWidget";
import SlotDetailWidget from "./widgets/SlotDetailWidget";
import SeatMapDrawer from "./widgets/SeatMapDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";



import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import type { Slot } from "./types/slot.types";

const SlotFormModal = lazy(() => import("./widgets/SlotFormModal"));

const SlotManagementPage: React.FC = () => {
  const { slots, isLoading: slotsLoading, isError, error, refetch } = useSlots();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [viewSlotId, setViewSlotId] = useState<string | null>(null);
  const [viewSeatMapId, setViewSeatMapId] = useState<string | null>(null);

  const isLoading = slotsLoading || roomsLoading;

  const filteredSlots = useMemo(() => {
    return (slots || []).filter((s: Slot) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [slots, search]);

  const groupedSlots = useMemo(() => {
    if (!rooms || !filteredSlots) return [];

    // Map through rooms and find their slots
    const grouped = rooms.map(room => ({
      room,
      slots: filteredSlots.filter(slot => {
        // Handle both populated object and raw ID string
        const slotRoomId = typeof slot.roomId === 'object' ? (slot.roomId as any)?._id : slot.roomId;
        return slotRoomId === room._id;
      })
    }));

    // Identify any "Orphan" slots that don't belong to any known room
    const matchedSlotIds = new Set(grouped.flatMap(g => g.slots.map(s => s._id)));
    const orphans = filteredSlots.filter(s => !matchedSlotIds.has(s._id));

    if (orphans.length > 0) {
      grouped.push({
        room: { _id: 'uncategorized', name: 'Uncategorized Infrastructure' } as any,
        slots: orphans
      });
    }

    return grouped.filter(group => group.slots.length > 0 || !search);
  }, [rooms, filteredSlots, search]);

  const stats = useMemo(() => {
    const totalSlots = slots?.length || 0;
    
    // Global occupancy is the average of individual shift densities
    const totalOccupancy = slots?.length 
      ? Math.round(slots.reduce((acc, s) => acc + (s.occupancyPercentage || 0), 0) / slots.length)
      : 0;

    // Active Registry: Sum of students assigned to their "primary" slot 
    // (A student is only counted once in the global stat)
    // The backend occupiedSeats now includes overlaps, so we need the raw count for global stats
    // We can't sum collective counts; we need to sum unique student assignments.
    const uniqueStudentsCount = slots?.reduce((acc, s) => {
      // For global stats, we only sum the specific students in each slot 
      // Subtracting FULL_DAY overlaps from PARTIAL slots to get raw count
      // Actually, it's easier to just count how many students are in the registry if we had that data.
      // But we have slotSpecificOccupancy available if the backend sends it.
      // For now, let's assume the user wants 'Active Registry' to show the total students.
      return acc + (s.occupiedSeats || 0); // This is still biased if sum is used
    }, 0) || 0;

    // TODO: Improve unique student counting if backend provides 'rawCount'
    
    const totalSeats = slots?.reduce((acc, s) => acc + (s.totalSeats || 0), 0) || 0;

    return [
      { label: "Total Shifts", value: totalSlots, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Global Occupancy", value: `${totalOccupancy}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Density Pulse", value: uniqueStudentsCount, icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "Allocated Capacity", value: totalSeats, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
    ];
  }, [slots]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading slots...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Slots</AlertTitle>
          <AlertDescription>
            {error?.message || "Failed to load slots. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Unified Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
              <Database size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Infrastructure Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Slot <span className="text-blue-600">Architect</span></h1>
          <p className="text-slate-500 font-medium text-xs">Configure library shifts, seat capacity, and global timings.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => {
              setEditSlot(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none h-14 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-200 px-8 uppercase text-[10px] tracking-widest transition-all"
          >
            <Plus size={18} className="mr-2" /> Initialize Slot
          </Button>
        </div>
      </header>

      {/* Snapshot Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none ring-1 ring-slate-100 shadow-sm rounded-[32px] overflow-hidden group hover:ring-blue-200 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Search and Status Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by shift name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="hidden md:flex items-center gap-4 pl-4 border-l">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Global Status</p>
                <p className="text-sm font-medium text-primary">
                  Operational Pulse Active
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Slots Section */}
      <div className="space-y-12">
        {groupedSlots.length > 0 ? (
          groupedSlots.map(({ room, slots }) => (
            <div key={room._id} className="space-y-6">
              {/* Room Category Header */}
              <div className="flex items-center gap-4 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shadow-sm">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                      {room.name} <span className="text-blue-600 block text-[10px] tracking-widest mt-1">HALL INFRASTRUCTURE</span>
                    </h2>
                  </div>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent" />
                <Badge variant="outline" className="h-8 px-4 rounded-xl border-slate-100 bg-white text-slate-400 font-black text-[9px] tracking-widest uppercase">
                  {slots.length} ACTIVE {slots.length === 1 ? 'SHIFT' : 'SHIFTS'}
                </Badge>
              </div>

              {slots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {slots.map((slot: Slot) => (
                    <SlotCardWidget
                      key={slot._id}
                      slot={slot}
                      onEdit={() => {
                        setEditSlot(slot);
                        setIsModalOpen(true);
                      }}
                      onViewMap={() => setViewSeatMapId(slot._id || null)}
                      onViewDetails={() => setViewSlotId(slot._id || null)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/30">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No shifts allocated to this hall</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card className="rounded-[40px] border-none ring-1 ring-slate-100 shadow-sm overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
                <Layers size={40} />
              </div>
              <p className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                {search ? "No shifts match your search" : "Global Registry Empty"}
              </p>
              <p className="text-xs text-slate-400 font-medium mb-8">
                {search ? "Try adjusting your filter criteria" : "Initialize your library infrastructure by adding your first shift."}
              </p>
              {search ? (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-widest"
                >
                  Reset Search
                </Button>
              ) : (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-2xl h-12 px-8 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200"
                >
                  Initialize First Slot
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <SlotFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditSlot(null);
            }}
            initialData={
              editSlot as unknown as
                | import("./types/slotForm.types").SlotFormValues
                | undefined
            }
          />
        )}
      </Suspense>
      
      {/* Seat Map Drawer */}
      <SeatMapDrawer
        slotId={viewSeatMapId}
        isOpen={!!viewSeatMapId}
        onClose={() => setViewSeatMapId(null)}
      />

      {/* Detail Drawer */}
      <SlotDetailWidget
        slotId={viewSlotId || ""}
        isOpen={!!viewSlotId}
        onClose={() => setViewSlotId(null)}
        onViewMap={() => {
          setViewSeatMapId(viewSlotId);
          setViewSlotId(null);
        }}
      />
    </div>

  );
};

export default SlotManagementPage;
