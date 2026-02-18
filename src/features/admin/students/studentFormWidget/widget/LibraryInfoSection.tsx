import React from "react";
import {
  LayoutGrid,
  Armchair,
  IndianRupee,
  Calendar,
  Clock,
  Info,
} from "lucide-react";

// Shadcn UI Components
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import type { UseFormReturn } from "react-hook-form";
import type { StudentFormValues } from "../type/AdminStudentForm.types";

type Slot = {
  _id: string;
  name: string;
  timeRange?: { start?: string; end?: string };
  monthlyFee?: number;
  totalSeats?: number;
  availableSeats?: number;
};

// Type for nested data structure
interface NestedDataResponse {
  data: Slot[];
}

// More flexible interface to handle different API response structures
interface SlotsResponse {
  success?: boolean;
  message?: string;
  data?: Slot[] | NestedDataResponse; // Handle nested data
  slots?: Slot[]; // Some APIs might return slots directly
}

interface LibraryInfoSectionProps {
  form: UseFormReturn<StudentFormValues>;
  slotsData: SlotsResponse | Slot[] | undefined; // Accept multiple types
  selectedSlotId: string;
}

// Type guard to check if data is NestedDataResponse
const isNestedDataResponse = (data: unknown): data is NestedDataResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as NestedDataResponse).data)
  );
};

const LibraryInfoSection: React.FC<LibraryInfoSectionProps> = ({
  form,
  slotsData,
  selectedSlotId,
}) => {
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = form;

  // Debug log to see what we're receiving
  React.useEffect(() => {
    console.log("LibraryInfoSection - slotsData received:", slotsData);
  }, [slotsData]);

  // Extract slots array safely from various possible response structures
  const slots: Slot[] = React.useMemo(() => {
    // If slotsData is undefined or null
    if (!slotsData) return [];

    // Case 1: Direct array of slots
    if (Array.isArray(slotsData)) {
      console.log("Slots is direct array:", slotsData);
      return slotsData;
    }

    // Case 2: Response with data property that is an array
    if (slotsData.data && Array.isArray(slotsData.data)) {
      console.log("Slots from data array:", slotsData.data);
      return slotsData.data;
    }

    // Case 3: Response with data.data structure (using type guard)
    if (slotsData.data && isNestedDataResponse(slotsData.data)) {
      console.log("Slots from nested data.data:", slotsData.data.data);
      return slotsData.data.data;
    }

    // Case 4: Response with slots property
    if (slotsData.slots && Array.isArray(slotsData.slots)) {
      console.log("Slots from slots array:", slotsData.slots);
      return slotsData.slots;
    }

    // Case 5: Response with success and data structure from your original type
    if (slotsData.success && slotsData.data && Array.isArray(slotsData.data)) {
      console.log("Slots from success response:", slotsData.data);
      return slotsData.data;
    }

    console.warn("Unknown slots data structure:", slotsData);
    return [];
  }, [slotsData]);

  // Find selected slot details
  const selectedSlot = React.useMemo(
    () => slots.find((s) => s._id === selectedSlotId),
    [slots, selectedSlotId],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Slot Selection */}
        <FormField
          control={control}
          name="slotId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
                <LayoutGrid size={12} className="text-blue-500" /> Operational
                Slot <span className="text-rose-500">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const selectedSlot = slots.find((s) => s._id === value);
                  if (selectedSlot?.monthlyFee !== undefined) {
                    setValue("monthlyFee", selectedSlot.monthlyFee, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-bold focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm hover:bg-slate-50/50">
                    <SelectValue placeholder="Select a slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  className="rounded-xl border-slate-200 shadow-xl bg-white max-h-[300px]"
                  position="popper"
                  sideOffset={4}
                >
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <SelectItem
                        key={slot._id}
                        value={slot._id}
                        className="font-bold py-3 focus:bg-blue-50 focus:text-blue-600 rounded-lg cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{slot.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium lowercase">
                            {slot.timeRange?.start || "—"} -{" "}
                            {slot.timeRange?.end || "—"}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-xs font-bold text-slate-400 text-center">
                      No slots available
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-rose-500 text-[10px] font-bold ml-1" />
            </FormItem>
          )}
        />

        {/* Designated Seat */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
            <Armchair size={12} className="text-blue-500" /> Designated Seat
          </label>
          <Input
            placeholder="e.g. A-12"
            {...register("seatNumber")}
            className="h-12 rounded-xl border-slate-200 bg-white font-bold focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm hover:bg-slate-50/50"
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
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
              ₹
            </span>
            <Input
              type="number"
              placeholder="0.00"
              className="pl-8 h-12 rounded-xl border-slate-200 bg-white font-black focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm hover:bg-slate-50/50"
              {...register("monthlyFee", { valueAsNumber: true })}
            />
          </div>
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
            className="h-12 rounded-xl border-slate-200 bg-white font-bold focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm hover:bg-slate-50/50"
          />
          {errors.joiningDate && (
            <p className="text-rose-500 text-[10px] font-bold ml-1">
              {errors.joiningDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Preview Widget - Only show if slot selected */}
      {selectedSlot && (
        <div className="mt-4 p-5 bg-[#0f172a] rounded-[24px] ring-1 ring-slate-800 shadow-inner animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <Info size={14} className="text-blue-400" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              Active Slot Snapshot
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock size={10} /> Timing
              </p>
              <p className="text-xs font-black text-white">
                {selectedSlot.timeRange?.start || "--"} —{" "}
                {selectedSlot.timeRange?.end || "--"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <IndianRupee size={10} /> Default Rate
              </p>
              <p className="text-xs font-black text-white">
                ₹{selectedSlot.monthlyFee || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <LayoutGrid size={10} /> Total Seats
              </p>
              <p className="text-xs font-black text-white">
                {selectedSlot.totalSeats || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Armchair size={10} /> Remaining
              </p>
              <p className="text-xs font-black text-blue-400">
                {selectedSlot.availableSeats || 0} Available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryInfoSection;
