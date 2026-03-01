import React, { memo } from "react";
import { X, ShieldCheck } from "lucide-react";
import { SeatMap } from "./SeatMap";
import { Button } from "@/components/ui/button";

interface SeatMapDrawerProps {
  slotId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const SeatMapDrawer: React.FC<SeatMapDrawerProps> = memo(({ slotId, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Wide Drawer Aside */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full lg:w-[85vw] xl:w-[75vw] bg-white z-[121] shadow-[0_0_100px_rgba(0,0,0,0.2)]
          transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) border-l border-slate-100
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col overflow-hidden
        `}
      >
        {/* Header Section */}
        <header className="px-6 py-4 sm:px-8 sm:py-6 bg-white border-b border-slate-50 flex items-center justify-between shrink-0 relative z-10">
           <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg ring-4 ring-slate-50">
                 <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-left">
                 <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Security <span className="text-blue-600 italic">Console</span>
                 </h2>
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Spatial Node Telemetry & Occupancy
                 </p>
              </div>
           </div>

           <button 
             onClick={onClose}
             className="p-2 sm:p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90"
           >
             <X size={18} className="sm:w-5 sm:h-5" />
           </button>
        </header>

        {/* Content Area - Houses the SeatMap */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-10 lg:p-16 bg-slate-50/30">
           {slotId ? (
              <SeatMap slotId={slotId} onCloseMap={onClose} />
           ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Data Synchronization</p>
              </div>
           )}
        </div>

        {/* Action Footer */}
        <footer className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
           <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Protocol Verified</p>
           </div>
           <Button 
             onClick={onClose}
             className="h-12 px-8 bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
           >
             Acknowledge & Exit
           </Button>
        </footer>
      </aside>
    </>
  );
});

SeatMapDrawer.displayName = "SeatMapDrawer";

export default SeatMapDrawer;
