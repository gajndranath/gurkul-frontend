import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ArrowLeft, ExternalLink, Zap } from "lucide-react";

interface QuickActionsCardProps {
  isEditMode: boolean;
  id?: string;
  reset: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  isEditMode,
  id,
  reset,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Header Label */}
      <div className="flex items-center gap-2 mb-4 opacity-80">
        <Zap size={14} className="text-blue-400" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Utility Bridge
        </p>
      </div>

      {/* Primary Detail View (Edit Mode Only) */}
      {isEditMode && id && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-11 gap-3 font-bold text-xs transition-all border-dashed"
          onClick={() => navigate(`/admin/students/${id}`)}
        >
          <ExternalLink size={16} className="text-blue-400" />
          Full Registry Profile
        </Button>
      )}

      {/* Reset Form */}
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start rounded-xl text-slate-400 hover:bg-slate-800 hover:text-amber-400 h-11 gap-3 font-bold text-xs transition-all"
        onClick={() => {
          if (window.confirm("Are you sure you want to clear all form data?")) {
            reset();
          }
        }}
      >
        <RotateCcw size={16} />
        Clear Form Data
      </Button>

      {/* Cancel Navigation */}
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white h-11 gap-3 font-bold text-xs transition-all"
        onClick={() => navigate("/admin/students")}
      >
        <ArrowLeft size={16} />
        Exit Configuration
      </Button>
    </div>
  );
};

export default QuickActionsCard;
