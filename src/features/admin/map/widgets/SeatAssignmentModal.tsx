import React, { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Loader2, 
  CheckCircle2,
  Armchair,
  MapPin,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudents, updateStudent } from "@/api/studentsAdminApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input, Badge } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";

interface SeatAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotId: string;
  seatNumber: string;
  slotName?: string;
}

const SeatAssignmentModal: React.FC<SeatAssignmentModalProps> = ({
  isOpen,
  onClose,
  slotId,
  seatNumber,
  slotName
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const searchInputRef = React.useRef<HTMLInputElement>(null);


  // 1. Fetch Students for Assignment
  const { data: studentsResponse, isLoading: isSearching } = useQuery({
    queryKey: ["students-for-assignment", debouncedSearch],
    queryFn: () => getStudents({ search: debouncedSearch, limit: 5 }),
    enabled: debouncedSearch.length >= 2,
  });

  const students = studentsResponse?.students || [];

  // 2. Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: (studentId: string) => 
      updateStudent(studentId, { slotId, seatNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatChart"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Short delay to show the success state in UI before closing
      setTimeout(() => {
        toast.success("Assignment Successful", `Seat ${seatNumber} has been allocated.`);
        onClose();
      }, 800);
    },
    onError: (err: any) => {
      toast.error("Assignment Failed", err.message || "Could not allocate seat.");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchInputRef.current?.focus();
        }}
      >
        <DialogHeader className="p-8 bg-slate-900 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-6 top-7 p-2 rounded-full bg-white/10 text-white/40 hover:bg-white/20 hover:text-white transition-all z-[60]"
          >
            <X size={18} />
          </button>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <UserPlus size={20} />
                </div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter">Deploy Member</DialogTitle>
             </div>
             
             <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-blue-400 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                   {slotName || "Current Shift"}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-xs font-black text-white/60 uppercase tracking-tighter flex items-center gap-1.5">
                   <MapPin size={12} /> Seat {seatNumber}
                </span>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
           <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <Input 
                 ref={searchInputRef}
                 placeholder="Search registry by name/ID..." 
                 className="h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
              {isSearching && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                 </div>
              )}
           </div>

           <div className="space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
              {isSearching ? (
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                       <div key={i} className="w-full h-20 animate-shimmer bg-slate-50 rounded-2xl border border-slate-100" />
                    ))}
                 </div>
              ) : students.length > 0 ? (
                students.map((student: any) => (
                  <button
                    key={student._id}
                    onClick={() => assignMutation.mutate(student._id)}
                    disabled={assignMutation.isPending}
                    className={cn(
                       "w-full p-4 flex items-center justify-between rounded-2xl border transition-all duration-300 group active:scale-[0.98] disabled:opacity-80 relative overflow-hidden",
                       assignMutation.isPending && assignMutation.variables === student._id 
                        ? "bg-blue-600 border-transparent text-white ring-4 ring-blue-100 z-10" 
                        : "bg-slate-50 border-transparent hover:border-blue-200 hover:bg-white text-slate-900"
                    )}
                  >
                    {/* Success Splash */}
                    {assignMutation.isSuccess && assignMutation.variables === student._id && (
                       <div className="absolute inset-0 bg-emerald-500 animate-in fade-in zoom-in-95 duration-500 flex items-center justify-center text-white z-20">
                          <CheckCircle2 size={32} className="animate-bounce" />
                       </div>
                    )}

                    <div className="flex items-center gap-4 text-left">
                       <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm",
                          assignMutation.isPending && assignMutation.variables === student._id 
                           ? "bg-white/20 text-white" 
                           : "bg-white text-slate-400 group-hover:bg-blue-600 group-hover:text-white"
                       )}>
                          {student.name.charAt(0)}
                       </div>
                       <div>
                          <p className={cn(
                             "text-[14px] font-black uppercase transition-colors leading-none mb-1",
                             assignMutation.isPending && assignMutation.variables === student._id 
                              ? "text-white" 
                              : "text-slate-900 group-hover:text-blue-600"
                          )}>
                             {student.name}
                          </p>
                          <p className={cn(
                             "text-[10px] font-bold uppercase tracking-tighter opacity-60",
                             assignMutation.isPending && assignMutation.variables === student._id ? "text-blue-100" : "text-slate-500"
                          )}>
                             ID: {student.studentId}
                          </p>
                       </div>
                    </div>
                    
                    <div className={cn(
                       "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                       assignMutation.isPending && assignMutation.variables === student._id 
                        ? "bg-white/20" 
                        : "bg-slate-100 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600"
                    )}>
                       {assignMutation.isPending && assignMutation.variables === student._id ? (
                          <Loader2 size={16} className="animate-spin" />
                       ) : (
                          <CheckCircle2 size={18} />
                       )}
                    </div>
                  </button>
                ))
              ) : search.length >= 2 ? (
                <div className="text-center py-16 opacity-40">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Registry search: No matches</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-[28px] border border-dashed border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Awaiting Credentials</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase italic">Input member name or permanent ID</p>
                </div>
              )}
           </div>

           <div className="pt-6 border-t border-slate-50">
              <div className="flex gap-4 items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                 <Armchair size={24} className="text-blue-600 shrink-0" />
                 <p className="text-[11px] font-bold text-blue-900 leading-relaxed italic">
                    Node assignment will trigger an automatic registry update and broadcast spatial occupancy to all terminals.
                 </p>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeatAssignmentModal;
