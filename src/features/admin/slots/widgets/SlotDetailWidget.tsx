import React, { memo, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getSlotDetails } from "../../../../api/slotApi";
import { useNavigate } from "react-router-dom";
import { calculateDuration, formatCurrency } from "../../../../lib/utils";
import type { SlotDetailsResponse } from "../types/slot.types";
import {
  Button,
  Input,
} from "../../../../components/ui";

interface SlotDetailWidgetProps {
  slotId: string;
  isOpen: boolean;
  onClose: () => void;
  onViewMap?: () => void;
}

const SlotDetailWidget: React.FC<SlotDetailWidgetProps> = memo(
  ({ slotId, isOpen, onClose, onViewMap }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const { data, isLoading, isError } = useQuery<SlotDetailsResponse>({
      queryKey: ["slot-details", slotId],
      queryFn: () => getSlotDetails(slotId),
      enabled: isOpen && !!slotId,
      staleTime: 30000,
      retry: false, // Stops the 404 error from looping in console
    });


    const insights = useMemo(() => {
      if (!data?.slot) return null;
      const { slot, occupancy } = data;
      const currentRevenue =
        (slot.monthlyFee || 0) * (occupancy.occupiedSeats || 0);
      const potentialRevenue = (slot.monthlyFee || 0) * (slot.totalSeats || 0);
      const collectionRate =
        potentialRevenue > 0
          ? Math.round((currentRevenue / potentialRevenue) * 100)
          : 0;
      const duration = calculateDuration(
        slot.timeRange?.start || "",
        slot.timeRange?.end || "",
      );

      return { currentRevenue, potentialRevenue, collectionRate, duration };
    }, [data]);

    const filteredStudents = useMemo(() => {
      const students = data?.students ?? [];
      if (!searchTerm) return students;
      const lowSearch = searchTerm.toLowerCase();
      return students.filter(
        (s) =>
          s.name.toLowerCase().includes(lowSearch) ||
          s.phone.includes(searchTerm) ||
          (s.seatNumber && s.seatNumber.toLowerCase().includes(lowSearch)),
      );
    }, [data, searchTerm]);

    // Handle 404 or other API Errors
    if (isError) {
      return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-full max-w-[400px] rounded-[32px] p-8 text-center bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-6">
              <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-50/50">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Not Found</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  The requested slot ID <code className="bg-slate-100 px-1 rounded text-rose-600 font-bold">{slotId.slice(-6)}</code> does not exist on the server.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95"
              >
                Close Terminal
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // We no longer return null here so the drawer can start its animation
    // if (isLoading && !data) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />
        
        {/* Drawer Nucleus */}
        <aside
          className={`
            fixed top-0 right-0 h-full w-full sm:w-[500px] bg-slate-50 z-[121] shadow-2xl 
            transition-transform duration-500 ease-in-out border-l border-white/20
            ${isOpen ? "translate-x-0" : "translate-x-full"}
            flex flex-col
          `}
        >
          {/* HEADER */}
          <header className="p-6 sm:p-8 bg-white border-b border-slate-100 relative overflow-hidden shrink-0">
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-all z-[60]"
            >
              <X size={20} />
            </button>

            {isLoading ? (
               <div className="flex items-center gap-4 animate-pulse">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-slate-100 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                     <div className="h-6 bg-slate-100 rounded-md w-1/2" />
                     <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                  </div>
               </div>
            ) : (
              <div className="flex items-center sm:items-start gap-4 text-left">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 ring-4 ring-indigo-50/50">
                  <Users size={20} className="sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                    {data?.slot?.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] sm:text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">
                      {insights?.duration}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> Shift Context
                    </span>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* INSIGHTS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-white border-b border-slate-50">
             <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-50 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Est. Monthly Revenue</p>
                {isLoading ? (
                   <div className="h-8 bg-slate-50 rounded-lg animate-pulse w-2/3" />
                ) : (
                  <div className="flex items-center gap-2">
                     <p className="text-lg sm:text-xl font-black text-slate-900 italic">{formatCurrency(insights?.currentRevenue || 0)}</p>
                     <div className="h-5 w-5 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                        <TrendingUp size={12} />
                     </div>
                  </div>
                )}
             </div>
             <div className="p-5 sm:p-6 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Capacity Yield</p>
                {isLoading ? (
                   <div className="h-8 bg-slate-50 rounded-lg animate-pulse w-2/3" />
                ) : (
                  <div className="flex items-center gap-2">
                     <p className="text-lg sm:text-xl font-black text-indigo-600 italic">{insights?.collectionRate}%</p>
                     <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${insights?.collectionRate}%` }} />
                     </div>
                  </div>
                )}
             </div>
          </div>

          {/* MEMBER REGISTRY SECTION */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
            <div className="p-6 pb-0 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Active Registry ({isLoading ? "..." : filteredStudents.length})</h3>
                  <button 
                    onClick={onViewMap}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                  >
                    View Map
                  </button>
               </div>
               
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                 <Input
                   placeholder="Search members by identity or seat..."
                   className="pl-12 h-12 bg-white border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 transition-all text-[11px] font-black uppercase tracking-tight"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   disabled={isLoading}
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
               {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="h-20 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                 ))
               ) : filteredStudents.length > 0 ? (
                 filteredStudents.map((s) => (
                   <div
                     key={s._id}
                     onClick={() => navigate(`/admin/students/${s._id}`)}
                     className="group flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                   >
                     <div className="flex items-center gap-4 text-left">
                       <div className="h-12 w-12 rounded-[20px] bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm shrink-0">
                         {s.name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                         <p className="font-black text-slate-900 text-[13px] uppercase tracking-tighter truncate group-hover:text-indigo-600 transition-colors mb-0.5">
                           {s.name}
                         </p>
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md uppercase tracking-widest leading-none border border-indigo-100/50">
                             {s.seatNumber ? `Seat ${s.seatNumber}` : "UNSET"}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                             {s.phone}
                           </span>
                         </div>
                       </div>
                     </div>
                     <div className="h-8 w-8 rounded-full flex items-center justify-center text-slate-200 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                       <ArrowRight size={16} />
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 opacity-20">
                   <Users size={48} className="mb-4 text-slate-300" />
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                     Registry Empty
                   </p>
                 </div>
               )}
            </div>
          </div>

          {/* FOOTER ACTION */}
          <footer className="p-6 sm:p-8 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Telemetry Status</p>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Live Sync Active</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 h-12 rounded-2xl border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Terminate View
            </Button>
          </footer>
        </aside>
      </>
    );
  },
);

SlotDetailWidget.displayName = "SlotDetailWidget";
export default SlotDetailWidget;
