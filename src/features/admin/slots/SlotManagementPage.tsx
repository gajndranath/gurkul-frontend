// frontend/src/features/admin/slots/SlotManagementPage.tsx
import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  Loader2,
  Plus,
  Search,
  Layers,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useSlots } from "./hooks/useSlots";
import SlotCardWidget from "./widgets/SlotCardWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeatMap } from "./widgets/SeatMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";


import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Slot } from "./types/slot.types";

const SlotFormModal = lazy(() => import("./widgets/SlotFormModal"));

const SlotManagementPage: React.FC = () => {
  const { slots, isLoading, isError, error, refetch } = useSlots();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [viewSeatMapId, setViewSeatMapId] = useState<string | null>(null);


  const filteredSlots = useMemo(() => {
    return (slots || []).filter((s: Slot) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [slots, search]);

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              <Layers className="h-3 w-3 mr-1" />
              Operational Core
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Slot Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure library shifts, seat capacity, and global timings.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditSlot(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Slot
        </Button>
      </div>

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

      {/* Slots Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Active Shifts
          </h2>
          <Separator className="flex-1" />
        </div>

        {filteredSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredSlots.map((slot: Slot) => (
              <SlotCardWidget
                key={slot._id}
                slot={slot}
                onEdit={() => {
                  setEditSlot(slot);
                  setIsModalOpen(true);
                }}
                onViewMap={() => setViewSeatMapId(slot._id || null)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                {search
                  ? "No shifts match your search"
                  : "No slots created yet"}
              </p>
              {search ? (
                <Button
                  variant="link"
                  onClick={() => setSearch("")}
                  className="text-primary"
                >
                  Reset Filters
                </Button>
              ) : (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="link"
                  className="text-primary"
                >
                  Create your first slot
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
       {/* Seat Map Modal */}
      {viewSeatMapId && (
        <Dialog open={!!viewSeatMapId} onOpenChange={() => setViewSeatMapId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-8 border-none shadow-2xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                Shift Occupancy Map
              </DialogTitle>
            </DialogHeader>
            <SeatMap slotId={viewSeatMapId} />
          </DialogContent>
        </Dialog>
      )}
    </div>

  );
};

export default SlotManagementPage;
