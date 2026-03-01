import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  RefreshCcw,
  Users,
  UserCheck,
  UserMinus,
  Archive,
  ChevronRight,
  ChevronLeft,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, Button, Input } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { getStudents, archiveStudent } from "@/api/studentsAdminApi";
import type { Student } from "./types";
import { RegistryTable } from "@/components/shared/RegistryTable";

interface ApiResponse {
  data?: {
    students?: Student[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  students?: Student[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const AdminStudentsListPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [archiveDialog, setArchiveDialog] = useState<{
    open: boolean;
    student: Student | null;
  }>({
    open: false,
    student: null,
  });

  const {
    data: studentsResponse,
    isLoading,
    isFetching,
  } = useQuery<ApiResponse>({
    queryKey: [
      "students",
      debouncedSearch,
      statusFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = {
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      };
      return await getStudents(params);
    },
  });

  const students = useMemo(() => {
    if (studentsResponse?.data?.students && Array.isArray(studentsResponse.data.students)) {
      return studentsResponse.data.students;
    }
    if (studentsResponse?.students && Array.isArray(studentsResponse.students)) {
      return studentsResponse.students;
    }
    if (Array.isArray(studentsResponse)) {
      return (studentsResponse as unknown) as Student[];
    }
    return [];
  }, [studentsResponse]);

  const pagination = useMemo(() => {
    return studentsResponse?.data?.pagination || studentsResponse?.pagination || null;
  }, [studentsResponse]);

  const { data: allStudentsResponse } = useQuery<ApiResponse>({
    queryKey: ["students", "ALL_FOR_STATS"],
    queryFn: () => getStudents({ limit: 10000, includeArchived: true }),
    staleTime: 5 * 60 * 1000,
  });

  const allStudents = useMemo(() => {
    if (allStudentsResponse?.data?.students) return allStudentsResponse.data.students;
    if (allStudentsResponse?.students) return allStudentsResponse.students;
    if (Array.isArray(allStudentsResponse)) return (allStudentsResponse as unknown) as Student[];
    return [];
  }, [allStudentsResponse]);

  const stats = useMemo(() => [
    { label: "Total Students", value: pagination?.total || allStudents.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: allStudents.filter((s: Student) => s.status === "ACTIVE").length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Inactive", value: allStudents.filter((s: Student) => s.status === "INACTIVE").length, icon: UserMinus, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Archived", value: allStudents.filter((s: Student) => s.status === "ARCHIVED").length, icon: Archive, color: "text-slate-500", bg: "bg-slate-100" },
  ], [allStudents, pagination]);

  const archiveMutation = useMutation({
    mutationFn: (studentId: string) => archiveStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student archived successfully");
      setArchiveDialog({ open: false, student: null });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to archive student");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-8 space-y-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1.5 px-2">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100 italic">
              <Database size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Registry Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Member Directory</h1>
          <p className="text-slate-500 font-medium text-xs">Manage your institutional membership nucleus.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto px-2">
          <Button 
            variant="outline" 
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white shadow-sm shrink-0" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["students"] })}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button 
            onClick={() => navigate("/admin/students/add")} 
            className="flex-1 lg:flex-none h-12 sm:h-14 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-slate-200 px-8 uppercase text-[10px] tracking-widest transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" /> Register Student
          </Button>
        </div>
      </header>

      {/* Snapshot Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none ring-1 ring-slate-100 shadow-sm rounded-3xl overflow-hidden group hover:ring-blue-100 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Interaction & Filter Section */}
      <section className="space-y-6 px-2">
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-[32px] ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="System-wide student search..." 
              className="pl-12 h-12 sm:h-14 bg-slate-50 border-none rounded-2xl ring-1 ring-slate-100 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 px-1">
            {["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"].map(status => (
              <Button 
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-10 sm:h-11 rounded-xl px-4 sm:px-6 font-black text-[9px] uppercase tracking-widest transition-all shrink-0 ${statusFilter === status ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <RegistryTable students={students} isLoading={isLoading} />

        {/* --- REFINED PAGINATION --- */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-8">
            <Button 
              variant="outline" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-slate-100 shadow-sm bg-white active:scale-90 transition-all"
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="h-12 sm:h-14 flex items-center px-6 sm:px-8 bg-white rounded-2xl ring-1 ring-slate-100 font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-sm italic text-slate-900">
               <span className="hidden sm:inline mr-1">Page</span> {pagination.page} <span className="text-slate-300 mx-3">/</span> {pagination.pages}
            </div>
            <Button 
              variant="outline" 
              disabled={currentPage === pagination.pages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-slate-100 shadow-sm bg-white active:scale-90 transition-all"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </section>

      <Dialog open={archiveDialog.open} onOpenChange={(open) => !open && setArchiveDialog({ open: false, student: null })}>
        <DialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-4 mx-auto">
              <Archive size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 text-center tracking-tighter uppercase italic">Archive Member?</DialogTitle>
          </DialogHeader>
          <p className="text-center text-slate-500 font-medium text-sm leading-relaxed mb-6">
            Are you sure you want to archive <span className="font-black text-slate-900">{archiveDialog.student?.name}</span>? This will free up their seat in the registry.
          </p>
          <DialogFooter className="flex gap-3">
            <Button variant="ghost" className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setArchiveDialog({ open: false, student: null })}>Cancel</Button>
            <Button className="flex-[2] rounded-2xl h-14 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100" onClick={() => archiveDialog.student?._id && archiveMutation.mutate(archiveDialog.student._id)}>Confirm Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudentsListPage;
