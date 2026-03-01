import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  IndianRupee, 
  MapPin, 
  Bell, 
  ShieldCheck,
  User,
  History,
  Clock,
  CreditCard,
  Calendar,
  Settings,
  ExternalLink,
  Edit3,
  Archive,
  RefreshCcw,
  FileText,
  LayoutGrid,
  Mail
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getStudent, 
  getStudentFeeSummary, 
  updateStudent as updateStudentApi,
  archiveStudent as archiveStudentApi,
  reactivateStudent as reactivateStudentApi
} from "@/api/studentsAdminApi";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Button,
  Badge,
  Switch,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/useToast";
import axiosInstance from "@/api/axiosInstance";
import PaymentActionModal from "@/features/admin/fees/widgets/PaymentActionModal";
import FeeCalendarView from "@/features/admin/fees/widgets/FeeCalendarView";
import ReminderHistory from "@/features/admin/fees/components/ReminderHistory";
import type { FeeHistoryItem } from "@/features/admin/fees/types/fee.types";
import { formatCurrency } from "@/lib/utils";

interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [financialView, setFinancialView] = useState<"timeline" | "calendar">("timeline");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // 1. Fetch Full Student Data (Nucleus Hub)
  const { data: fullStudentData } = useQuery({
    queryKey: ["student-details", student?._id],
    queryFn: () => getStudent(student?._id || ""),
    enabled: !!student?._id && isOpen,
  });

  const activeStudent = fullStudentData?.student || student;

  // 2. Fetch Fee Summary
  const { data: feeSummary, isLoading: isFeeLoading } = useQuery({
    queryKey: ["student-fees", student?._id],
    queryFn: () => getStudentFeeSummary(student?._id || ""),
    enabled: !!student?._id && isOpen,
  });

  // 3. Quick Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateStudentApi(student?._id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-details", student?._id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Sync Success", "Profile updated in real-time");
    },
    onError: () => toast.error("Sync Error", "Failed to update profile"),
  });

  // 4. Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: (reason: string) => archiveStudentApi(student?._id || "", reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-details", student?._id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsArchiveDialogOpen(false);
      toast.success("Archived", "Profile moved to archive and seat released");
    },
    onError: () => toast.error("Error", "Failed to archive student"),
  });

  // 5. Reactivate Mutation
  const reactivateMutation = useMutation({
    mutationFn: () => reactivateStudentApi(student?._id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-details", student?._id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsReactivateDialogOpen(false);
      toast.success("Reactivated", "Student profile is now active again");
    },
    onError: () => toast.error("Error", "Failed to reactivate student"),
  });

  if (!student) return null;

  const handleNotify = async () => {
    setIsSendingReminder(true);
    try {
      await axiosInstance.post("/fees/overdue-reminders/bulk", {
        studentIds: [activeStudent._id],
      });
      toast.success("Reminder Sent", "Internal notification triggered successfully");
    } catch {
      toast.error("Error", "Failed to send internal reminder");
    } finally {
      setIsSendingReminder(false);
    }
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      <aside
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[540px] bg-slate-50 z-[151] shadow-2xl 
          transition-transform duration-500 ease-in-out border-l border-white/20
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* HEADER: Profile Nucleus */}
        <header className="p-6 sm:p-8 bg-white border-b border-slate-100 relative overflow-hidden shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors z-[60]"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
             <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[28px] sm:rounded-[32px] bg-slate-900 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-2xl italic border-4 border-white shrink-0">
                {activeStudent.name?.charAt(0) || "?"}
             </div>
             
             <div className="flex-1 space-y-2 text-center sm:text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                   <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase truncate max-w-[200px] sm:max-w-none">{activeStudent.name}</h2>
                   </div>
                   <div className="flex gap-4 mr-0 sm:mr-24"> {/* Significantly increased margin and gap */}
                      {activeStudent.status === "ARCHIVED" ? (
                        <div className="flex items-center gap-2 bg-blue-50/50 p-1 rounded-2xl border border-blue-100/50 shadow-sm">
                           <Badge variant="outline" className="bg-blue-100 text-blue-700 border-none text-[8px] font-black uppercase px-2 py-0.5 shadow-sm">Restore</Badge>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-10 w-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                             onClick={() => setIsReactivateDialogOpen(true)}
                           >
                              <RefreshCcw size={18} />
                           </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                          onClick={() => setIsArchiveDialogOpen(true)}
                        >
                           <Archive size={18} />
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm"
                          onClick={() => {
                            onClose();
                            navigate(`/admin/students/edit/${activeStudent._id}`);
                          }}
                        >
                           <Edit3 size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm"
                          onClick={() => {
                            onClose();
                            navigate(`/admin/students/${activeStudent._id}`);
                          }}
                        >
                           <ExternalLink size={18} />
                        </Button>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
                   <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {activeStudent.libraryId || activeStudent._id?.slice(-8).toUpperCase()}
                   </p>
                   <Badge variant="outline" className={`
                      text-[9px] font-black uppercase px-3 py-1 rounded-full border-none shadow-sm
                      ${activeStudent.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : 
                        activeStudent.status === "ARCHIVED" ? "bg-slate-900 text-white shadow-lg" : 
                        "bg-rose-100 text-rose-700"}
                   `}>
                     {activeStudent.status || "ACTIVE"}
                   </Badge>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                   <button 
                     className="flex items-center gap-1.5 p-2 px-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                     onClick={() => {
                        onClose();
                        navigate(`/admin/map?seat=${activeStudent.seatNumber}`);
                     }}
                   >
                      <MapPin size={12} className="text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-slate-600 uppercase group-hover:text-blue-700">Seat {activeStudent.seatNumber || "UNSET"}</span>
                   </button>
                   <div className="flex items-center gap-1.5 p-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">
                        {(typeof activeStudent.slotId === 'object' && activeStudent.slotId?.roomId?.name) || "Global"} — {activeStudent.slotId?.name || "Global"}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </header>

        {/* CONTENT NUCLEUS: Tabs for specific modules */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 p-4 sm:p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-white p-1 rounded-2xl h-12 sm:h-14 shadow-sm border border-slate-100 mt-4 overflow-x-auto custom-scrollbar">
              <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <User size={14} className="mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="financials" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <IndianRupee size={14} className="mr-2" /> Financials
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <History size={14} className="mr-2" /> Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 group hover:border-blue-500 transition-all cursor-default">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                     <p className="text-2xl font-black text-slate-900 italic">92%</p>
                     <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Above Average</p>
                  </div>
                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 group hover:border-rose-500 transition-all cursor-default">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Balance</p>
                     <p className="text-2xl font-black text-rose-500 italic">₹{feeSummary?.data?.totals?.totalDue || 0}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">LOCKED IN LEDGER</p>
                  </div>
               </div>

               {/* CITS: Library Allocation Section */}
               <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                     <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Settings size={14} className="text-blue-500" /> CITS Allocation Details
                     </h3>
                     <Badge className="bg-blue-50 text-blue-600 text-[8px] font-black">ACTIVE PLAN</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <LayoutGrid size={10} /> Allocated Room
                        </p>
                        <p className="text-xs font-black text-slate-700">
                           {(typeof activeStudent.slotId === 'object' && activeStudent.slotId?.roomId?.name) || "Global"}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Clock size={10} /> Slot timing
                        </p>
                        <p className="text-xs font-black text-slate-700">
                           {activeStudent.slotId?.timeRange?.start || "00:00"} — {activeStudent.slotId?.timeRange?.end || "00:00"}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Mail size={10} /> Digital Mail
                        </p>
                        <p className="text-xs font-black text-slate-700 truncate">{activeStudent.email || "No Email linked"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <CreditCard size={10} /> Subscription
                        </p>
                        <p className="text-xs font-black text-slate-700">{formatCurrency(activeStudent.monthlyFee || 0)} / mo</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Calendar size={10} /> Enrollment
                        </p>
                        <p className="text-xs font-black text-slate-700">
                           {activeStudent.joiningDate ? new Date(activeStudent.joiningDate).toLocaleDateString() : "Pending"}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <User size={10} /> Parent/Guardian
                        </p>
                        <p className="text-xs font-black text-slate-700 truncate">{activeStudent.fatherName || "Not Specified"}</p>
                     </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <MapPin size={10} /> Residential Address
                     </p>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-100">
                        {activeStudent.address || "No residential address linked to this profile."}
                     </p>
                  </div>
               </div>

               {/* Internal Notes Module */}
               <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={14} className="text-amber-500" /> Admin Internal Notes
                  </h3>
                  <div className="relative">
                    <Textarea 
                      placeholder="Add private staff notes here... (e.g. Behavioral alerts, custom discounts)"
                      className="min-h-[100px] rounded-2xl border-none bg-slate-50 text-[11px] font-bold text-slate-700 focus-visible:ring-1 focus-visible:ring-amber-200 transition-all resize-none"
                      defaultValue={activeStudent.notes}
                      onBlur={(e) => {
                        if (e.target.value !== activeStudent.notes) {
                          updateMutation.mutate({ notes: e.target.value });
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 opacity-20">
                       <FileText size={16} />
                    </div>
                  </div>
               </div>

               {/* Status Toggles Hub */}
               <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-5">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck size={14} className="text-emerald-500" /> Status & Verifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Label htmlFor="active-status" className="text-[10px] font-black text-slate-600 uppercase">Profile Active</Label>
                      <Switch 
                        id="active-status" 
                        checked={activeStudent.status === "ACTIVE"} 
                        onCheckedChange={(checked: boolean) => updateMutation.mutate({ status: checked ? "ACTIVE" : "INACTIVE" })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Label htmlFor="email-verified" className="text-[10px] font-black text-slate-600 uppercase">Email verified</Label>
                      <Switch 
                        id="email-verified" 
                        checked={activeStudent.emailVerified} 
                        onCheckedChange={(checked: boolean) => updateMutation.mutate({ emailVerified: checked })}
                      />
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Bell size={14} className="text-blue-500" /> Member Contact Hub
                  </h3>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400">
                              <Bell size={14} />
                           </div>
                           <span className="text-[11px] font-bold text-slate-700 uppercase">{activeStudent.phone || "+91 00000 00000"}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-lg text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(`tel:${activeStudent.phone}`)}
                        >
                          CALL
                        </Button>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400">
                              <Mail size={14} />
                           </div>
                           <span className="text-[11px] font-bold text-slate-700 uppercase truncate max-w-[180px]">{activeStudent.email || "No Email linked"}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-lg text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(`mailto:${activeStudent.email}`)}
                          disabled={!activeStudent.email}
                        >
                          MAIL
                        </Button>
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="financials" className="mt-6 space-y-4">
               {/* Financial View Selector */}
               <div className="flex items-center gap-2 bg-white p-1 rounded-2xl w-fit border border-slate-100 shadow-sm ml-auto mr-auto">
                 <Button 
                   variant={financialView === "timeline" ? "default" : "ghost"} 
                   size="sm" 
                   className={`h-10 rounded-xl font-black text-[9px] uppercase tracking-widest ${financialView === "timeline" ? "bg-slate-900" : "text-slate-400"}`}
                   onClick={() => setFinancialView("timeline")}
                 >
                   Timeline
                 </Button>
                 <Button 
                   variant={financialView === "calendar" ? "default" : "ghost"} 
                   size="sm" 
                   className={`h-10 rounded-xl font-black text-[9px] uppercase tracking-widest ${financialView === "calendar" ? "bg-slate-900" : "text-slate-400"}`}
                   onClick={() => setFinancialView("calendar")}
                 >
                   Calendar
                 </Button>
               </div>

               {financialView === "calendar" ? (
                 <div className="p-1 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                   <FeeCalendarView studentId={activeStudent._id} readOnly />
                 </div>
               ) : (
                 <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recent Ledger entries</h3>
                       <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">Live Status</span>
                    </div>
                    
                    <div className="space-y-2">
                       {isFeeLoading ? (
                         [1,2].map(i => <div key={i} className="h-14 w-full bg-slate-50 animate-pulse rounded-xl" />)
                       ) : feeSummary?.data?.feeHistory?.length > 0 ? (
                         feeSummary.data.feeHistory.slice(0, 4).map((record: FeeHistoryItem, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${record.status === "PAID" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                                   <IndianRupee size={14} />
                                </div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{getMonthName(record.month)} {record.year}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">{record.status}</p>
                                </div>
                             </div>
                             <span className="text-[12px] font-black text-slate-900">{formatCurrency(record.totalAmount)}</span>
                           </div>
                         ))
                       ) : (
                         <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <History size={32} className="text-slate-200 mb-3" />
                            <p className="text-[10px] text-slate-400 italic text-center uppercase font-black tracking-widest">No recent ledger activity</p>
                         </div>
                       )}
                    </div>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
                <ReminderHistory studentId={activeStudent._id} limit={10} />
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER: Quick Actions Nucleus */}
        <footer className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
          {activeStudent.status === "ARCHIVED" ? (
            <Button 
              className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              onClick={() => setIsReactivateDialogOpen(true)}
            >
              <RefreshCcw size={18} /> Reactivate Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-14 border-slate-100 text-slate-900 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all"
                onClick={handleNotify}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? (
                  <RefreshCcw size={16} className="mr-2 animate-spin" />
                ) : (
                  <Bell size={16} className="mr-2 text-blue-500" />
                )}
                {isSendingReminder ? "Sending..." : "Send Reminder"}
              </Button>
              <Button 
                className="flex-[2] rounded-2xl h-14 bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <IndianRupee size={16} className="mr-2" /> Collect Fee
              </Button>
            </>
          )}
        </footer>
      </aside>

      {/* CONFIRMATION DIALOGS */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl bg-white z-[200]">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
              <Archive className="h-10 w-10 text-rose-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic">
                 Archive Member<span className="text-rose-600">?</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-3 text-sm font-bold leading-relaxed">
                This will release seat <strong className="text-slate-900">{activeStudent.seatNumber || "UNSET"}</strong> and move the profile to the official archive history. You can still view their ledger later.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl font-black h-14 text-[10px] uppercase tracking-widest"
              onClick={() => setIsArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-2xl font-black h-14 bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-100 text-[10px] uppercase tracking-widest"
              onClick={() => archiveMutation.mutate("Administrative Cleanup")}
              disabled={archiveMutation.isPending}
            >
              Confirm Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl bg-white z-[200]">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <RefreshCcw className="h-10 w-10 text-blue-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic">
                 Reactivate Profile<span className="text-blue-600">.</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-3 text-sm font-bold leading-relaxed">
                Restore <strong className="text-slate-900">{activeStudent.name}</strong> to the active registry. You will need to manually re-assign them a seat from the interactive map.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl font-black h-14 text-[10px] uppercase tracking-widest"
              onClick={() => setIsReactivateDialogOpen(false)}
            >
              Discard
            </Button>
            <Button
              className="flex-1 rounded-2xl font-black h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 text-[10px] uppercase tracking-widest"
              onClick={() => reactivateMutation.mutate()}
              disabled={reactivateMutation.isPending}
            >
              Let's Go
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PAYMENT MODAL INTEGRATION */}
      {isPaymentModalOpen && (
        <PaymentActionModal 
          studentId={activeStudent._id}
          item={feeSummary?.data?.feeHistory?.[0] || { 
            month: new Date().getMonth() + 1, 
            year: new Date().getFullYear(), 
            totalAmount: activeStudent.monthlyFee || 0,
            status: "DUE",
            baseFee: activeStudent.monthlyFee || 0,
            dueCarriedForward: 0,
            paidAmount: 0,
            remainingAmount: activeStudent.monthlyFee || 0,
            coveredByAdvance: false,
            locked: false,
            daysOverdue: 0
          }}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["student-fees", activeStudent._id] });
          }}
        />
      )}
    </>
  );
};
