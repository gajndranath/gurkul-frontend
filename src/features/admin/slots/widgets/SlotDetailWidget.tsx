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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  Input,
  Button,
  Badge,
} from "../../../../components/ui";
import { useNavigate } from "react-router-dom";
import { calculateDuration, formatCurrency } from "../../../../lib/utils";
import type { SlotDetailsResponse } from "../types/slot.types";

interface SlotDetailWidgetProps {
  slotId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SlotDetailWidget: React.FC<SlotDetailWidgetProps> = memo(
  ({ slotId, isOpen, onClose }) => {
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
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="w-[92vw] max-w-[400px] rounded-[28px] p-8 text-center bg-white border-none shadow-2xl">
            <div className="space-y-6">
              <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-50/50">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                  Record Not Found
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium leading-relaxed">
                  The requested slot ID{" "}
                  <code className="bg-slate-100 px-1 rounded text-rose-600 font-bold">
                    {slotId.slice(-6)}
                  </code>{" "}
                  does not exist on the server.
                </DialogDescription>
              </div>
              <Button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95"
              >
                Close Terminal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (isLoading && !data) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl bg-white outline-none [&>button]:hidden sm:max-w-[500px]">
          <DialogHeader className="p-6 border-b border-slate-50 bg-white relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-7 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all z-50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 text-left">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                  {data?.slot?.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed member list for slot {data?.slot?.name}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                    {insights?.duration}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                    <Clock size={10} /> Active Registry
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Insights Strip */}
          <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-50">
            <div className="space-y-0.5 text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Est. Revenue
              </p>
              <p className="text-sm font-black text-slate-900">
                {formatCurrency(insights?.currentRevenue || 0)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-black text-blue-600">
                  {insights?.collectionRate}% Yield
                </span>
                <TrendingUp size={12} className="text-emerald-500" />
              </div>
              <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden ml-auto">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${insights?.collectionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Member List */}
          <div className="p-6 space-y-4 max-h-[60vh] flex flex-col">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Search by name, phone or seat..."
                className="pl-10 h-11 bg-slate-50 border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-xs font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => navigate(`/admin/students/${s._id}`)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter leading-none">
                            {s.seatNumber ? `Seat ${s.seatNumber}` : "No Seat"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {s.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                  <Users size={32} className="mb-2 text-slate-200" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    No Registry Found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Verified Log
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Close View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

SlotDetailWidget.displayName = "SlotDetailWidget";
export default SlotDetailWidget;
