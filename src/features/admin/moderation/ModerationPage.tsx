import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  UserCheck, 
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ModerationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [filterStatus, setFilterStatus] = useState("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["moderation", "reports", filterStatus],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/moderation/reports?status=${filterStatus}`);
      return data.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, status, adminNote }: any) => {
      await axiosInstance.patch(`/moderation/reports/${reportId}`, { status, adminNote });
    },
    onSuccess: () => {
      success("Report status updated");
      queryClient.invalidateQueries({ queryKey: ["moderation", "reports"] });
    },
    onError: () => error("Failed to update report status"),
  });

  const moderateUserMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: any) => {
      await axiosInstance.post(`/moderation/user/${userId}/action`, { action, reason });
    },
    onSuccess: (_, variables) => {
      success(`User ${variables.action.toLowerCase()}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ["moderation", "reports"] });
    },
    onError: () => error("Moderation action failed"),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const reports = data?.reports || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Moderation Hub</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Manage user reports and maintain platform integrity.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          {["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${filterStatus === status 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-20 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <CheckCircle className="text-slate-300" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clear Transmission</h3>
              <p className="text-slate-400 font-medium max-w-xs">No pending reports detected in this frequency.</p>
            </div>
          </div>
        ) : (
          reports.map((report: any) => (
            <div 
              key={report._id}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden group"
            >
              {/* Accents */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 
                ${report.reason === 'HARASSMENT' ? 'bg-red-500' : 'bg-orange-500'}`} 
              />
              
              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                      ${report.reason === 'HARASSMENT' 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}
                    >
                      {report.reason.replace("_", " ")}
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {format(new Date(report.createdAt), "MMM d, yyyy · HH:mm")}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl flex gap-2 text-slate-400 hover:text-slate-900 h-10 px-4"
                      onClick={() => resolveMutation.mutate({ reportId: report._id, status: "DISMISSED" })}
                    >
                      <XCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dismiss</span>
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl flex gap-2 bg-slate-900 text-white shadow-lg shadow-slate-900/10 h-10 px-4"
                      onClick={() => resolveMutation.mutate({ reportId: report._id, status: "RESOLVED" })}
                    >
                      <CheckCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Resolve</span>
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reporter</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-900">
                        {report.reporterId?.name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{report.reporterId?.name || "Unknown"}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ID: {report.reporterId?.libraryId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reported User</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-900">
                          {report.reportedId?.name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{report.reportedId?.name || "Unknown"}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ID: {report.reportedId?.libraryId}</div>
                            <span className={`w-1.5 h-1.5 rounded-full ${report.reportedId?.status === 'BANNED' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <span className="text-[8px] font-black uppercase text-slate-400">{report.reportedId?.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50">
                            <MoreVertical size={16} className="text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => moderateUserMutation.mutate({ userId: report.reportedId?._id, action: "BAN", reason: `Banned due to report ${report._id}: ${report.reason}` })}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-not-allowed focus:bg-red-50 group transition-colors"
                          >
                            <XCircle size={16} className="text-red-600" />
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-red-600 uppercase tracking-tight">Ban Permanently</span>
                              <span className="text-[9px] font-bold text-red-400">Total exclusion from grid</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => moderateUserMutation.mutate({ userId: report.reportedId?._id, action: "SUSPEND", reason: `Suspended due to report ${report._id}: ${report.reason}` })}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-orange-50 group transition-colors"
                          >
                            <AlertTriangle size={16} className="text-orange-600" />
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-orange-600 uppercase tracking-tight">Suspend Account</span>
                              <span className="text-[9px] font-bold text-orange-400">Temporary access freeze</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-50 my-1" />
                          <DropdownMenuItem 
                            onClick={() => moderateUserMutation.mutate({ userId: report.reportedId?._id, action: "ACTIVATE" })}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-emerald-50 group transition-colors"
                          >
                            <UserCheck size={16} className="text-emerald-600" />
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-emerald-600 uppercase tracking-tight">Restore Access</span>
                              <span className="text-[9px] font-bold text-emerald-400">Reactivate active status</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Report Description</h4>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                    "{report.description || "No additional context provided."}"
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModerationPage;
