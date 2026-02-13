import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  LayoutGrid,
  Armchair,
  IndianRupee,
  Calendar,
  Clock,
  Info,
} from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  Control,
} from "react-hook-form";

import type { StudentFormValues } from "../type/AdminStudentForm.types";

type Slot = {
  _id: string;
  name: string;
  timeRange?: {
    start?: string;
    end?: string;
  };
  monthlyFee?: number;
  totalSeats?: number;
  availableSeats?: number;
};

interface LibraryInfoSectionProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
  control: Control<StudentFormValues>; // Added control for Shadcn Select
  slotsData: { data: Slot[] } | undefined;
  selectedSlotId: string;
}

const LibraryInfoSection: React.FC<LibraryInfoSectionProps> = ({
  register,
  errors,
  setValue,
  control,
  slotsData,
  selectedSlotId,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Slot Selection - Pure Shadcn UI */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
            <LayoutGrid size={12} className="text-blue-500" /> Operational Slot{" "}
            <span className="text-rose-500">*</span>
          </label>

          <Controller
            control={control}
            name="slotId"
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Manually sync monthly fee if needed on change
                  const selectedSlot = slotsData?.data.find(
                    (s) => s._id === value,
                  );
                  if (selectedSlot?.monthlyFee) {
                    setValue("monthlyFee", selectedSlot.monthlyFee, {
                      shouldValidate: true,
                    });
                  }
                }}
                value={field.value}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm">
                  <SelectValue placeholder="Select a slot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {Array.isArray(slotsData?.data) &&
                  slotsData.data.length > 0 ? (
                    slotsData.data.map((slot) => (
                      <SelectItem
                        key={slot._id}
                        value={slot._id}
                        className="font-bold py-3 focus:bg-blue-50 focus:text-blue-600 rounded-lg"
                      >
                        {slot.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-xs font-bold text-slate-400 text-center">
                      No slots available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />

          {errors.slotId && (
            <p className="text-rose-500 text-[10px] font-bold ml-1">
              {errors.slotId.message}
            </p>
          )}
        </div>

        {/* Seat Number */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
            <Armchair size={12} className="text-blue-500" /> Designated Seat
          </label>
          <Input
            placeholder="e.g. A-12"
            {...register("seatNumber")}
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm"
          />
          {errors.seatNumber && (
            <p className="text-rose-500 text-[10px] font-bold ml-1">
              {errors.seatNumber.message}
            </p>
          )}
        </div>

        {/* Monthly Fee */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
            <IndianRupee size={12} className="text-blue-500" /> Subscription Fee{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">
              ₹
            </span>
            <Input
              type="number"
              placeholder="0.00"
              className="pl-8 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm"
              {...register("monthlyFee", { valueAsNumber: true })}
            />
          </div>
          <p className="text-[9px] text-slate-400 font-medium ml-1 italic">
            Auto-synced from slot; editable override.
          </p>
          {errors.monthlyFee && (
            <p className="text-rose-500 text-[10px] font-bold ml-1">
              {errors.monthlyFee.message}
            </p>
          )}
        </div>

        {/* Joining Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
            <Calendar size={12} className="text-blue-500" /> Enrollment Date
          </label>
          <Input
            type="date"
            {...register("joiningDate")}
            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all shadow-sm"
          />
          {errors.joiningDate && (
            <p className="text-rose-500 text-[10px] font-bold ml-1">
              {errors.joiningDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Slot Details Preview Widget */}
      {selectedSlotId &&
        Array.isArray(slotsData?.data) &&
        (() => {
          const slot = slotsData.data.find(
            (s: Slot) => s._id === selectedSlotId,
          );
          if (!slot) return null;
          return (
            <div className="mt-4 p-5 bg-[#0f172a] rounded-[24px] ring-1 ring-slate-800 shadow-inner animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Info size={14} className="text-blue-400" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                  Active Slot Snapshot
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-none">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Clock size={10} /> Timing
                  </p>
                  <p className="text-xs font-black text-white">
                    {slot.timeRange?.start} — {slot.timeRange?.end}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <IndianRupee size={10} /> Default Rate
                  </p>
                  <p className="text-xs font-black text-white">
                    ₹{slot.monthlyFee}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <LayoutGrid size={10} /> Total Seats
                  </p>
                  <p className="text-xs font-black text-white">
                    {slot.totalSeats}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Armchair size={10} /> Remaining
                  </p>
                  <p className="text-xs font-black text-blue-400">
                    {slot.availableSeats} Available
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default LibraryInfoSection;
