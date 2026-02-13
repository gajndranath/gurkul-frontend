import React from "react";
import { CheckCircle2, Circle, User, LayoutGrid, Info } from "lucide-react";
import { Badge } from "../../../../../components/ui";

interface FormValues {
  name?: string;
  phone?: string;
  monthlyFee?: number;
  slotId?: string;
}

interface Slot {
  _id: string;
  name: string;
  availableSeats: number;
}

interface SlotsData {
  data: Slot[];
}

interface SummaryCardProps {
  formValues: FormValues;
  selectedSlotId: string;
  slotsData: SlotsData | undefined;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  formValues,
  selectedSlotId,
  slotsData,
}) => {
  const selectedSlot = slotsData?.data?.find(
    (s: Slot) => s._id === selectedSlotId,
  );

  const requirements = [
    { label: "Identity Verified", met: (formValues?.name?.length || 0) >= 2 },
    {
      label: "Contact Active",
      met: /^[0-9]{10}$/.test(formValues?.phone || ""),
    },
    { label: "Slot Assigned", met: !!formValues?.slotId },
    { label: "Rate Defined", met: (formValues?.monthlyFee || 0) > 0 },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 ring-1 ring-slate-200 shadow-sm space-y-6">
      {/* 1. Header Snapshot */}
      <div className="space-y-1">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
          <Info size={14} /> Profile Snapshot
        </p>
        <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate">
          {formValues?.name || "Drafting Profile..."}
        </h3>
      </div>

      {/* 2. Visual Data Strip */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
            <User size={12} className="text-blue-500" /> Phone
          </span>
          <span className="text-slate-700">{formValues?.phone || "—"}</span>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
            <LayoutGrid size={12} className="text-blue-500" /> Slot
          </span>
          <span className="text-slate-700">
            {selectedSlot?.name || "Unselected"}
          </span>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-200/60 flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Monthly Rate
            </p>
            <p className="text-xl font-black text-blue-600 tracking-tighter">
              ₹{formValues?.monthlyFee || 0}
            </p>
          </div>
          {selectedSlot && (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black py-0.5">
              {selectedSlot.availableSeats} SEATS LEFT
            </Badge>
          )}
        </div>
      </div>

      {/* 3. Validation Checklist */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Validation Check
        </p>
        <div className="grid grid-cols-1 gap-2">
          {requirements.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                item.met
                  ? "bg-blue-50/50 ring-1 ring-blue-100"
                  : "bg-slate-50 opacity-40 grayscale"
              }`}
            >
              {item.met ? (
                <CheckCircle2 size={16} className="text-blue-600" />
              ) : (
                <Circle size={16} className="text-slate-300" />
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${item.met ? "text-blue-900" : "text-slate-400"}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
