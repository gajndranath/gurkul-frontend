import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  RefreshCcw,
  Users,
  UserCheck,
  UserMinus,
  Archive,
  MoreHorizontal,
  Mail,
  Phone,
  LayoutGrid,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Edit,
  User,
} from "lucide-react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from "../../../hooks/useToast";
import { useDebounce } from "../../../hooks/useDebounce";
import { getStudents, archiveStudent } from "../../../api/studentsAdminApi";
import { getAllSlots } from "../../../api/slotApi";
import type { Student } from "./types";

type Slot = {
  _id: string;
  name: string;
  monthlyFee?: number;
};

// Add this interface to match your API response structure
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
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [archiveDialog, setArchiveDialog] = useState<{
    open: boolean;
    student: Student | null;
  }>({
    open: false,
    student: null,
  });

  // Fetch students with filters
  const {
    data: studentsResponse,
    isLoading,
    isFetching,
  } = useQuery<ApiResponse>({
    queryKey: [
      "students",
      debouncedSearch,
      statusFilter,
      slotFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = {
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        slotId: slotFilter !== "ALL" ? slotFilter : undefined,
      };
      const res = await getStudents(params);
      console.log("Students API Response:", res); // Debug log
      return res;
    },
  });

  // Extract students array safely - handle different response structures
  const students = React.useMemo(() => {
    // Case 1: Response has data.students (like { data: { students: [...] } })
    if (
      studentsResponse?.data?.students &&
      Array.isArray(studentsResponse.data.students)
    ) {
      return studentsResponse.data.students;
    }
    // Case 2: Response has students directly (like { students: [...] })
    if (
      studentsResponse?.students &&
      Array.isArray(studentsResponse.students)
    ) {
      return studentsResponse.students;
    }
    // Case 3: Response is the array itself
    if (Array.isArray(studentsResponse)) {
      return studentsResponse;
    }
    return [];
  }, [studentsResponse]);

  // Extract pagination safely
  const pagination = React.useMemo(() => {
    if (studentsResponse?.data?.pagination) {
      return studentsResponse.data.pagination;
    }
    if (studentsResponse?.pagination) {
      return studentsResponse.pagination;
    }
    return null;
  }, [studentsResponse]);

  // Fetch slots for filter
  const { data: slotsData } = useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const res = await getAllSlots();
      console.log("Slots API Response:", res); // Debug log
      return res ?? [];
    },
  });

  // Fetch all students for stats
  const { data: allStudentsResponse } = useQuery<ApiResponse>({
    queryKey: ["students", "ALL_FOR_STATS"],
    queryFn: async () => {
      const res = await getStudents({ limit: 10000 });
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Extract all students safely for stats
  const allStudents = React.useMemo(() => {
    if (
      allStudentsResponse?.data?.students &&
      Array.isArray(allStudentsResponse.data.students)
    ) {
      return allStudentsResponse.data.students;
    }
    if (
      allStudentsResponse?.students &&
      Array.isArray(allStudentsResponse.students)
    ) {
      return allStudentsResponse.students;
    }
    if (Array.isArray(allStudentsResponse)) {
      return allStudentsResponse;
    }
    return [];
  }, [allStudentsResponse]);

  // Calculate stats
  const stats = useMemo(() => {
    return [
      {
        label: "Total Students",
        value: pagination?.total || allStudents.length || 0,
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Active",
        value: allStudents.filter((s: Student) => s.status === "ACTIVE").length,
        icon: UserCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Inactive",
        value: allStudents.filter((s: Student) => s.status === "INACTIVE")
          .length,
        icon: UserMinus,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Archived",
        value: allStudents.filter((s: Student) => s.status === "ARCHIVED")
          .length,
        icon: Archive,
        color: "text-slate-500",
        bg: "bg-slate-100",
      },
    ];
  }, [allStudents, pagination]);

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (studentId: string) => archiveStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student archived successfully");
      setArchiveDialog({ open: false, student: null });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to archive student",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Syncing Registry...
          </p>
        </div>
      </div>
    );
  }

  // Debug log to see what's being rendered
  console.log("Rendering students:", students);
  console.log("Students count:", students.length);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              Registry Core
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Student Directory
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm">
            Manage member profiles, billing cycles, and seat allocations.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-white shadow-sm hover:rotate-180 transition-all duration-500 h-12 w-12"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["students"] })
            }
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={() => navigate("/admin/students/add")}
            className="flex-1 sm:flex-none h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 gap-2 px-6 uppercase text-[11px] tracking-widest active:scale-95 transition-all"
          >
            <Plus size={18} /> Add Student
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-none shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden transition-all hover:shadow-md"
          >
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                    {stat.value}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <section className="bg-white p-4 rounded-[24px] ring-1 ring-slate-200 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Slot Filter */}
          <Select value={slotFilter} onValueChange={setSlotFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-xl shadow-sm font-medium border-slate-200 bg-white">
              <SelectValue placeholder="Filter by Slot" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[300px]">
              <SelectItem value="ALL" className="rounded-lg font-medium">
                All Slots
              </SelectItem>
              {Array.isArray(slotsData) &&
                slotsData.map((slot: Slot) => (
                  <SelectItem
                    key={slot._id}
                    value={slot._id}
                    className="rounded-lg font-medium"
                  >
                    {slot.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[150px] rounded-xl shadow-sm font-medium border-slate-200 bg-white">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL" className="rounded-lg font-medium">
                All Status
              </SelectItem>
              <SelectItem value="ACTIVE" className="rounded-lg font-medium">
                Active
              </SelectItem>
              <SelectItem value="INACTIVE" className="rounded-lg font-medium">
                Inactive
              </SelectItem>
              <SelectItem value="ARCHIVED" className="rounded-lg font-medium">
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Students Table */}
      <Card className="border-none shadow-xl rounded-[32px] overflow-hidden ring-1 ring-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="py-5 px-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Student
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Contact
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Slot
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Balance
                </TableHead>
                <TableHead className="text-right pr-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student: Student) => (
                  <TableRow
                    key={student._id || student.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {student.name?.charAt(0) || "?"}
                        </div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" />
                          {student.email || "—"}
                          {student.emailVerified && (
                            <div className="h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <ShieldCheck size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          {student.phone || "—"}
                          {student.phoneVerified && (
                            <div className="h-3 w-3 bg-emerald-500 rounded-full flex items-center justify-center">
                              <ShieldCheck size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusStyles(
                          student.status || "INACTIVE",
                        )}
                      >
                        {student.status || "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LayoutGrid size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">
                          {typeof student.slotId === "object"
                            ? student.slotId?.name
                            : student.slotId || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                         <p className={`text-xs font-black ${(student.totalDue || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                           ₹{student.totalDue || 0}
                         </p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                           Outstanding
                         </p>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ActionDropdown
                        student={student}
                        onArchive={(s) =>
                          setArchiveDialog({ open: true, student: s })
                        }
                        navigate={navigate}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 h-10 px-4 font-bold text-xs gap-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </Button>
          <div className="flex items-center gap-2">
            <span className="h-10 min-w-[40px] flex items-center justify-center bg-white ring-1 ring-slate-200 rounded-xl text-xs font-black text-slate-900">
              {currentPage}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              of {pagination.pages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 h-10 px-4 font-bold text-xs gap-2"
            disabled={currentPage >= (pagination.pages || 1)}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Archive Dialog */}
      <Dialog
        open={archiveDialog.open}
        onOpenChange={(open) => setArchiveDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[400px] rounded-[28px] p-6">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Archive className="h-8 w-8 text-rose-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">
              Archive Student
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium pt-2">
              This will deactivate{" "}
              <span className="font-bold">{archiveDialog.student?.name}</span>.
              The profile can be restored later from the archive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-bold h-12"
              onClick={() => setArchiveDialog({ open: false, student: null })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white h-12"
              disabled={archiveMutation.isPending}
              onClick={() => {
                const id =
                  archiveDialog.student?._id || archiveDialog.student?.id;
                if (id) archiveMutation.mutate(id);
              }}
            >
              {archiveMutation.isPending ? "Archiving..." : "Confirm Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const getStatusStyles = (status: string) => {
  const baseStyles =
    "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border";
  switch (status) {
    case "ACTIVE":
      return `${baseStyles} bg-emerald-50 text-emerald-600 border-emerald-200`;
    case "INACTIVE":
      return `${baseStyles} bg-amber-50 text-amber-600 border-amber-200`;
    case "ARCHIVED":
      return `${baseStyles} bg-slate-50 text-slate-500 border-slate-200`;
    default:
      return `${baseStyles} bg-slate-50 text-slate-400 border-slate-200`;
  }
};

interface ActionDropdownProps {
  student: Student;
  onArchive: (student: Student) => void;
  navigate: NavigateFunction;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  student,
  onArchive,
  navigate,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="rounded-2xl bg-white p-1.5 border-slate-200 shadow-xl"
    >
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5"
          onClick={() =>
            navigate(`/admin/students/${student._id || student.id}`)
          }
        >
          <User size={14} /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5 text-blue-600 focus:text-blue-600 focus:bg-blue-50"
          onClick={() =>
            navigate(`/admin/students/edit/${student._id || student.id}`)
          }
        >
          <Edit size={14} /> Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
          onClick={() => onArchive(student)}
        >
          <Archive size={14} /> Archive Student
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="p-6 bg-slate-50 rounded-full mb-4">
      <Users className="h-12 w-12 text-slate-300" />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
      No Students Found
    </p>
    <p className="text-slate-400 text-xs mt-2">
      Try adjusting your filters or add a new student
    </p>
  </div>
);

export default AdminStudentsListPage;
