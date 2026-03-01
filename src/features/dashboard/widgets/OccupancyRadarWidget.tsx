import React from "react";
import { 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SlotOccupancy {
  _id: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  occupancyPercentage: number;
}

interface OccupancyRadarWidgetProps {
  slots: SlotOccupancy[];
}

const OccupancyRadarWidget: React.FC<OccupancyRadarWidgetProps> = ({ slots }) => {
  const navigate = useNavigate();
  
  const sortedSlots = [...slots].sort((a, b) => b.occupancyPercentage - a.occupancyPercentage);
  const topSlots = sortedSlots.slice(0, 5);

  return (
    <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden group h-full flex flex-col">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full border-blue-500/30 bg-blue-500/10 text-blue-400 px-3 py-1">
              Infrastructure Pulse
            </Badge>
          </div>
          <h3 className="text-xl font-black tracking-tighter uppercase">
            Occupancy <span className="text-blue-500">Radar</span>
          </h3>
        </div>
        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40 group-hover:text-blue-500 transition-colors">
           <Activity size={20} />
        </div>
      </div>

      <CardContent className="p-8 space-y-8 flex-1">
        <div className="space-y-6">
          {topSlots.map((slot) => (
            <div key={slot._id} className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Shift Node</p>
                   <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                     {slot.name}
                   </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 leading-none italic">{Math.round(slot.occupancyPercentage)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target Load</p>
                </div>
              </div>
              
              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    slot.occupancyPercentage > 80 ? "bg-rose-500" :
                    slot.occupancyPercentage > 50 ? "bg-blue-600" : "bg-emerald-500"
                  )}
                  style={{ width: `${slot.occupancyPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-400">
                 <span>Active: {slot.occupiedSeats} Nodes</span>
                 <span>Capacity: {slot.totalSeats} Nodes</span>
              </div>
            </div>
          ))}

          {slots.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                <Layers size={40} className="mb-4 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Operational Telemetry</p>
             </div>
          )}
        </div>

        <div className="p-6 bg-blue-50 rounded-[28px] border border-blue-100/50 flex items-center gap-4 relative overflow-hidden group/alert">
           <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5 leading-none">Strategy Insight</p>
              <p className="text-[11px] font-bold text-blue-900/70 leading-relaxed italic">
                Identify "Cold Spots" in partial shifts to optimize spatial allocation and maximize revenue yield.
              </p>
           </div>
        </div>
      </CardContent>

      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={() => navigate("/admin/slots")}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
        >
          Optimize Infrastructure <ArrowUpRight size={14} />
        </button>
      </div>
    </Card>
  );
};

export default OccupancyRadarWidget;
