import React, { useState } from "react";
import { Plus, Search, Layers, ShieldCheck, Loader2 } from "lucide-react";
import { useRooms } from "./hooks/useRooms";
import { RoomFormModal } from "./widgets/RoomFormModal";
import RoomCardWidget from "./widgets/RoomCardWidget";
import type { Room, RoomFormData } from "./types/room.types";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const RoomManagementPage: React.FC = () => {
  const { rooms, isLoading, createRoom, updateRoom, deleteRoom, isCreating, isUpdating } = useRooms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filteredRooms = (rooms || []).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full border-blue-100 bg-blue-50/50 text-blue-600 px-3 py-1">
              Infrastructure Core
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
            Room <span className="text-blue-600">Inventory</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] max-w-md">
            Architect your physical library presence through optimized spatial definitions and density control.
          </p>
        </div>

        <Button 
          onClick={openCreateModal} 
          className="w-full sm:w-auto h-14 px-8 rounded-[20px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-blue-200/50 gap-3 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> New Space Configuration
        </Button>
      </div>

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
    </div>
  );
};

export default RoomManagementPage;
