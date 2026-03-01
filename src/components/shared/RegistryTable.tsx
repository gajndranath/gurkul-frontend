import React from "react";
import { 
  User, 
  ChevronRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";

interface RegistryTableProps {
  students: any[];
  isLoading: boolean;
  type?: "REGISTRY" | "ATTENDANCE" | "FINANCIAL";
}

/**
 * RegistryTable
 * A unified grid for student entities.
 * Promotes the "Nucleus" pattern by opening the EntityDrawer on row click.
 */
export const RegistryTable: React.FC<RegistryTableProps> = ({ 
  students, 
  isLoading}) => {
  const openDrawer = useUIStore((s) => s.openEntityDrawer);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-[32px] border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-8">Member</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Seat/Slot</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Financials</TableHead>
              <TableHead className="w-[50px] pr-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => {
              if (!student) return null;
              return (
                <TableRow 
                  key={student._id || Math.random()} 
                  className="group cursor-pointer border-slate-50 hover:bg-blue-50/30 transition-colors"
                  onClick={() => openDrawer(student)}
                >
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all italic">
                        {student.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900 leading-none uppercase tracking-tight">{student.name || "Unknown"}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">ID: {student.libraryId}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{student.seatNumber || "UNSET"}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{student.slotId?.name || "Global 04"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-5">
                    <Badge variant="outline" className={`
                       text-[9px] font-black uppercase tracking-widest leading-none py-1.5 px-3 rounded-full border-none shadow-sm
                       ${student.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : 
                         student.status === "ARCHIVED" ? "bg-slate-900 text-white shadow-lg" : 
                         "bg-slate-100 text-slate-500"}
                    `}>
                      {student.status || "ACTIVE"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-5">
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                           <div className={`h-1.5 w-1.5 rounded-full ${(student.totalDue || 0) > 0 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-emerald-500"}`} />
                           <span className="text-[13px] font-black text-slate-900 italic">₹{(student.totalDue || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Base: ₹{student.monthlyFee || 0}</span>
                     </div>
                  </TableCell>

                  <TableCell className="py-5 pr-8 text-right">
                    <div className="flex items-center justify-end">
                       <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-[-45deg] shadow-sm">
                          <ChevronRight size={16} className="group-hover:translate-x-0.5" />
                       </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {students?.map((student) => {
          if (!student) return null;
          return (
            <div 
              key={student._id || Math.random()}
              onClick={() => openDrawer(student)}
              className="bg-white p-6 rounded-[32px] ring-1 ring-slate-100 shadow-sm active:scale-[0.98] transition-all space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 italic shadow-sm">
                    {student.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{student.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {student.libraryId}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`
                  text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-sm
                  ${student.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : 
                    student.status === "ARCHIVED" ? "bg-slate-900 text-white shadow-lg" : 
                    "bg-slate-100 text-slate-500"}
                `}>
                  {student.status || "ACTIVE"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deployment</p>
                  <p className="text-xs font-black text-slate-900 uppercase">Seat {student.seatNumber || "Unset"}</p>
                  <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">{student.slotId?.name || "Global"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Financials</p>
                  <p className="text-xs font-black text-rose-600">₹{(student.totalDue || 0).toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 italic">Due Amount</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Registry Sync</span>
                </div>
                <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 gap-2">
                  View Nucleus <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {(!students || students.length === 0) && (
        <div className="p-16 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
           <User size={48} className="mx-auto text-slate-100 mb-6" />
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Registry search yielded zero matches</p>
        </div>
      )}
    </div>
  );
};
