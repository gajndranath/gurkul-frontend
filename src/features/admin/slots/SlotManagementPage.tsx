import React, { useState, useMemo, lazy, Suspense } from "react";
import { Loader2, Plus, Search, Layers, ShieldCheck } from "lucide-react";
import { useSlots } from "./hooks/useSlots";
import SlotCardWidget from "./widgets/SlotCardWidget";
import { Button, Input } from "../../../components/ui";
import { Separator } from "../../../components/ui/separator";
import type { Slot } from "./types/slot.types";

const SlotFormModal = lazy(() => import("./widgets/SlotFormModal"));

const SlotManagementPage: React.FC = () => {
  const { slots, isLoading } = useSlots();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSlots = useMemo(() => {
    return (slots || []).filter((s: Slot) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [slots, search]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing Library Grid...
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* 1. HEADER: Blue Accent + Clean White Typography */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
              <Layers size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              Operational Core
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Slot Management
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
            Configure library shifts, seat capacity, and global timings.
          </p>
        </div>

        {/* PRIMARY ACTION: Blue & White Scheme */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 gap-2 h-12 px-6 font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95"
        >
          <Plus size={18} /> Create New Slot
        </Button>
      </header>

      {/* 2. SEARCH & UTILITY: White Card with Blue Accents */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[24px] ring-1 ring-slate-200 shadow-sm border-b-2 border-blue-50">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Filter by shift name..."
            className="pl-11 bg-slate-50 border-none rounded-xl h-12 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hidden md:flex items-center gap-4 px-4 border-l border-slate-100">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Global Status
            </p>
            <p className="text-xs font-bold text-blue-600">
              Operational Pulse Active
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
            <ShieldCheck className="text-blue-600" size={16} />
          </div>
        </div>
      </section>

      {/* 3. GRID SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Active Shifts
          </h2>
          <Separator className="flex-1 opacity-50 bg-blue-100" />
        </div>

        {filteredSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredSlots.map((slot: Slot) => (
              <SlotCardWidget key={slot._id} slot={slot} />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[32px] ring-1 ring-slate-200 border-dashed border-2 border-slate-100">
            <Layers className="text-slate-200 mb-2" size={40} />
            <p className="text-slate-400 font-bold text-sm">
              No shifts match your search
            </p>
            <Button
              variant="link"
              onClick={() => setSearch("")}
              className="text-blue-600 font-bold text-xs uppercase"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        {isModalOpen && (
          <SlotFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Suspense>

      <div className="h-10 md:hidden" />
    </div>
  );
};

export default SlotManagementPage;
