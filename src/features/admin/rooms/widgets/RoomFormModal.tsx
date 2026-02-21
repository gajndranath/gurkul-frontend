import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Home, Armchair, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Room, RoomFormData } from "../types/room.types";

const roomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  totalSeats: z.coerce.number().min(1, "At least 1 seat is required"),
  description: z.string().optional().or(z.literal("")),
});

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => Promise<void>;
  initialData?: Room;
  isSubmitting: boolean;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      totalSeats: initialData?.totalSeats || 0,
      description: initialData?.description || "",
    },
  });


  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        totalSeats: initialData.totalSeats,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        totalSeats: 0,
        description: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: RoomFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] z-[100] max-w-[420px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white outline-none [&>button]:hidden animate-in zoom-in-95 duration-200">
        {/* Modern Header */}
        <DialogHeader className="p-8 border-b border-slate-50 bg-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-7 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all z-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 rounded-[20px] flex items-center justify-center shrink-0">
              <Home size={22} className="text-blue-600" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                {initialData ? "Edit Hall" : "Create Room"}
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Infrastructure Core Unit
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-6">
            {/* Room Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Spatial Identification
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Master Hall A" 
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="totalSeats"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Seat Density Configuration
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Armchair size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <Input 
                        type="number" 
                        placeholder="e.g. 50" 
                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Amenities & Logistics
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Info size={16} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                      <Textarea 
                        placeholder="Define AC, Wi-Fi, or specific rules for this space..." 
                        className="pl-11 min-h-[100px] rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-600 leading-relaxed resize-none shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl font-bold font-black text-slate-400 uppercase text-[10px] tracking-widest hover:bg-slate-50"
              >
                Dismiss
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                {isSubmitting ? "Finalizing Spatial Data..." : (initialData ? "Update Config" : "Deploy Room")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

