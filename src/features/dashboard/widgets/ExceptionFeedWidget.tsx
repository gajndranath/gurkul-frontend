import React from "react";
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { useNavigate } from "react-router-dom";

interface Exception {
  id: string;
  type: "OVERDUE" | "LOW_OCCUPANCY" | "EXPIRING" | "SYSTEM";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  timestamp: string;
  actionPath?: string;
  metadata?: any;
}

interface ExceptionFeedWidgetProps {
  exceptions: Exception[];
}

const ExceptionFeedWidget: React.FC<ExceptionFeedWidgetProps> = ({ exceptions }) => {
  const { openEntityDrawer } = useUIStore();
  const navigate = useNavigate();

  const getSeverityStyles = (severity: Exception["severity"]) => {
    switch (severity) {
      case "critical": return "bg-rose-50 border-rose-100 text-rose-600";
      case "high": return "bg-amber-50 border-amber-100 text-amber-600";
      default: return "bg-blue-50 border-blue-100 text-blue-600";
    }
  };

  const getIcon = (type: Exception["type"], severity: Exception["severity"]) => {
    const className = cn("h-5 w-5", 
      severity === "critical" ? "text-rose-500" : 
      severity === "high" ? "text-amber-500" : "text-blue-500"
    );
    
    switch (type) {
      case "OVERDUE": return <Clock className={className} />;
      case "LOW_OCCUPANCY": return <TrendingDown className={className} />;
      case "EXPIRING": return <Users className={className} />;
      default: return <AlertTriangle className={className} />;
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden group h-full flex flex-col">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-full border-rose-100 bg-rose-50 text-rose-600 px-3 py-1">
              Operational Anomalies
            </Badge>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            Exception <span className="text-rose-500">Feed</span>
          </h3>
        </div>
        <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
           <AlertTriangle size={20} />
        </div>
      </div>

      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">
        {exceptions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {exceptions.map((exception) => (
              <div 
                key={exception.id}
                onClick={() => {
                  if (exception.type === "OVERDUE" && exception.metadata?.studentId) {
                    openEntityDrawer({ _id: exception.metadata.studentId, name: exception.title });
                  } else if (exception.actionPath) {
                    navigate(exception.actionPath);
                  }
                }}
                className="p-6 hover:bg-slate-50 transition-all cursor-pointer group/item flex items-start gap-5 relative group"
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-105",
                  getSeverityStyles(exception.severity)
                )}>
                  {getIcon(exception.type, exception.severity)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-black text-slate-900 group-hover/item:text-rose-600 transition-colors">
                      {exception.title}
                    </p>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">
                      {exception.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                    {exception.description}
                  </p>
                  
                  {exception.metadata?.amount && (
                     <p className="text-[10px] font-black text-rose-500 mt-2 uppercase tracking-tighter">
                        ₹{exception.metadata.amount} Liability Detected
                     </p>
                  )}
                </div>

                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity self-center pr-2">
                   <ChevronRight size={18} className="text-rose-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-[40px] flex items-center justify-center mb-6 ring-1 ring-emerald-100">
               <Target className="h-10 w-10 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-2">Zero Deviations</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed italic">
              All infrastructure nodes and student accounts are reporting within authorized operational parameters.
            </p>
          </div>
        )}
      </CardContent>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <button 
          onClick={() => navigate("/admin/due")}
          className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
        >
          View Full Risk Matrix <ArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
};

export default ExceptionFeedWidget;
