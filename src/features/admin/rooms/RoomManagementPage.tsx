import React, { useState, useMemo } from "react";
import { Plus, ShieldCheck, Loader2, Home, Database, Users2, Activity, Layers, Search } from "lucide-react";
import { useRooms } from "./hooks/useRooms";
import { useSlots } from "../slots/hooks/useSlots"; // Added to calculate stats
import { RoomFormModal } from "./widgets/RoomFormModal";
import { RoomDetailWidget } from "./widgets/RoomDetailWidget";
import RoomCardWidget from "./widgets/RoomCardWidget";
import type { Room, RoomFormData } from "./types/room.types";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const RoomManagementPage: React.FC = () => {
  const { rooms, isLoading: roomsLoading, createRoom, updateRoom, deleteRoom, isCreating, isUpdating } = useRooms();
  const { slots, isLoading: slotsLoading } = useSlots();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState("");

  const isLoading = roomsLoading || slotsLoading;

  const filteredRooms = useMemo(() => (rooms || []).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  ), [rooms, search]);

  const stats = useMemo(() => {
    const totalRooms = rooms?.length || 0;
    const activeRooms = rooms?.filter(r => r.isActive).length || 0;
    const totalCapacity = rooms?.reduce((acc, r) => acc + (r.totalSeats || 0), 0) || 0;
    const totalSlots = slots?.length || 0;

    return [
      { label: "Total Halls", value: totalRooms, icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Active Units", value: activeRooms, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "System Capacity", value: totalCapacity, icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "Total Shifts", value: totalSlots, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
    ];
  }, [rooms, slots]);

  const handleCreate = async (data: RoomFormData) => {
    await createRoom(data);
  };

  const handleUpdate = async (data: RoomFormData) => {
    if (selectedRoom) {
      await updateRoom({ id: selectedRoom._id, data });
    }
  };

  const openCreateModal = () => {
    setSelectedRoom(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room? This might affect seat assignments.")) {
      await deleteRoom(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Spatial Nodes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-10 space-y-10">
      {/* Unified Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
              <Database size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Infrastructure Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Room <span className="text-blue-600">Inventory</span></h1>
          <p className="text-slate-500 font-medium text-xs">Architect your physical library presence and density control.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={openCreateModal} 
            className="flex-1 sm:flex-none h-14 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-200 px-8 uppercase text-[10px] tracking-widest transition-all"
          >
            <Plus size={18} className="mr-2" /> New Space
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

      {/* Global Context & Control */}
      <Card className="border-none shadow-sm bg-slate-50/50 rounded-[32px] overflow-hidden p-1">
        <CardContent className="p-4 bg-white rounded-[28px]">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full md:max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Filter halls by nomenclature..."
                className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold shadow-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="hidden lg:flex items-center gap-6 pl-8 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Status</p>
                <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">
                  Real-time Sync Active
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-100 shadow-inner">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Inventory */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap">
            Operational Units ({filteredRooms.length})
          </h2>
          <Separator className="bg-slate-100 flex-1 h-[1px]" />
        </div>

        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRooms.map((room) => (
              <RoomCardWidget
                key={room._id}
                room={room}
                onEdit={() => openEditModal(room)}
                onDelete={() => handleDelete(room._id)}
                onViewDetails={() => setViewRoom(room)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 bg-white rounded-[48px] shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 ring-1 ring-slate-100">
                <Layers className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-3">
                {search ? "Query Mismatch" : "Zero Node Presence"}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-10 max-w-sm leading-relaxed">
                {search 
                  ? "We couldn't locate any infrastructure units matching your search parameters in the current registry."
                  : "No physical halls have been initialized. Begin your library architecture by deploying your first room configuration."}
              </p>
              {!search && (
                <Button 
                  onClick={openCreateModal}
                  variant="outline" 
                  className="rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em] border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Deploy First Unit
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedRoom ? handleUpdate : handleCreate}
        initialData={selectedRoom}
        isSubmitting={isCreating || isUpdating}
      />

      <RoomDetailWidget
        isOpen={!!viewRoom}
        onClose={() => setViewRoom(null)}
        room={viewRoom}
      />
    </div>
  );
};

export default RoomManagementPage;
