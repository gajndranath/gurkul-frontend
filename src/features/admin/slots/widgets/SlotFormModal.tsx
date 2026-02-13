import React, { useMemo } from "react";
import {
  useForm,
  useWatch,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Armchair, CheckCircle2, X, Settings2 } from "lucide-react";
import { slotSchema, type SlotFormValues } from "../types/slotForm.types";
import { useSlots } from "../hooks/useSlots";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from "../../../../components/ui";

interface SlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SlotFormValues & { _id?: string };
}

const SlotFormModal: React.FC<SlotFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { createSlot, updateSlot, isSaving } = useSlots();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema) as Resolver<SlotFormValues>,
    defaultValues: initialData || {
      name: "",
      timeRange: { start: "09:00", end: "18:00" },
      monthlyFee: 500,
      totalSeats: 50,
    },
  });

  const watchedValues = useWatch({ control });

  // Real-time Validation Checklist
  const checklist = useMemo(
    () => [
      { label: "Valid Name", met: (watchedValues.name?.length || 0) >= 3 },
      {
        label: "Timings Set",
        met: !!watchedValues.timeRange?.start && !!watchedValues.timeRange?.end,
      },
      {
        label: "Capacity > 0",
        met: (Number(watchedValues.totalSeats) || 0) >= 1,
      },
    ],
    [watchedValues],
  );

  const onSubmit: SubmitHandler<SlotFormValues> = async (data) => {
    try {
      if (initialData?._id) await updateSlot({ id: initialData._id, data });
      else await createSlot(data);
      reset();
      onClose();
    } catch {
      /* Handled by hook */
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] z-[100] max-w-[400px] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl bg-white outline-none [&>button]:hidden">
        {/* --- BRANDED HEADER WITH CUSTOM X --- */}
        <DialogHeader className="p-6 border-b border-slate-50 bg-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-7 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all z-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Settings2 size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                {initialData ? "Edit Shift" : "Create Slot"}
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Infrastructure Configuration
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* --- FORM CONTENT --- */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 bg-white"
        >
          {/* Shift Name */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
              Slot Identification
            </label>
            <Input
              {...register("name")}
              className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
              placeholder="e.g. Full Day Elite"
            />
            {errors.name && (
              <p className="text-rose-500 text-[10px] font-bold">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Time Selection Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
                <Clock size={10} className="text-blue-500" /> Start
              </label>
              <Input
                type="time"
                {...register("timeRange.start")}
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
                <Clock size={10} className="text-blue-500" /> End
              </label>
              <Input
                type="time"
                {...register("timeRange.end")}
                className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-sm"
              />
            </div>
          </div>

          {/* Capacity & Fee Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
                Seat Capacity
              </label>
              <div className="relative group">
                <Armchair className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="number"
                  {...register("totalSeats")}
                  className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50/50 font-black text-slate-900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
                Monthly Fee
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">
                  ₹
                </span>
                <Input
                  type="number"
                  {...register("monthlyFee")}
                  className="pl-7 h-11 rounded-xl border-slate-100 bg-slate-50/50 font-black text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Validation Checklist / Hint */}
          <div className="p-4 bg-slate-50 rounded-2xl flex flex-wrap gap-x-4 gap-y-2 items-center border border-slate-100">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2
                  size={12}
                  className={item.met ? "text-emerald-500" : "text-slate-200"}
                />
                <span
                  className={`text-[9px] font-black uppercase ${item.met ? "text-slate-600" : "text-slate-300"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold text-slate-400 text-xs h-12 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || checklist.some((c) => !c.met)}
              className="flex-[2] rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]"
            >
              {isSaving
                ? "Saving..."
                : initialData
                  ? "Update Changes"
                  : "Initialize Slot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SlotFormModal;
