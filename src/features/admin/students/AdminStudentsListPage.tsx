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
} from "lucide-react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../../../components/ui/dropdown-menu";

import { useToast } from "../../../hooks/useToast";
import { useDebounce } from "../../../hooks/useDebounce";
import { getStudents, archiveStudent } from "../../../api/studentsApi";
import { getAllSlots } from "../../../api/slotApi";
import type { Student } from "./types";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Slot = {
  _id: string;
  name: string;
  monthlyFee?: number;
};

interface ActionDropdownProps {
  student: Student;
  onArchive: (s: Student) => void;
  navigate: NavigateFunction;
}

const AdminStudentsListPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 700);
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

  const {
    data: studentsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "students",
      debouncedSearch,
      statusFilter,
      slotFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = {
        query: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        slotId: slotFilter !== "ALL" ? slotFilter : undefined,
      };
      const res = await getStudents(params);
      return res;
    },
  });

  const { data: slotsData } = useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const res = await getAllSlots();
      return res.data;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (studentId: string) =>
      archiveStudent(studentId, "Archived from list"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student archived successfully");
      setArchiveDialog({ open: false, student: null });
    },
  });

  const { data: allStudentsData } = useQuery({
    queryKey: ["students", "ALL_FOR_STATS"],
    queryFn: async () => {
      const res = await getStudents({ limit: 10000 });
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = useMemo(() => {
    const students = Array.isArray(allStudentsData?.students)
      ? allStudentsData.students
      : [];
    return [
      {
        label: "Total Students",
        value: allStudentsData?.pagination?.total || 0,
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Active",
        value: students.filter((s: Student) => s.status === "ACTIVE").length,
        icon: UserCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Arrears/Inactive",
        value: students.filter((s: Student) => s.status === "INACTIVE").length,
        icon: UserMinus,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Archived",
        value: students.filter((s: Student) => s.status === "ARCHIVED").length,
        icon: Archive,
        color: "text-slate-500",
        bg: "bg-slate-100",
      },
    ];
  }, [allStudentsData]);

  if (isLoading)
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

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10">
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
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
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md">
            Manage member profiles, billing cycles, and seat allocations.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-white shadow-sm hover:rotate-180 transition-all duration-500 h-12 w-12 shrink-0"
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

      {/* 2. STATS GRID */}
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

      {/* 3. UTILITY BAR */}
      <section className="bg-white p-4 rounded-[24px] ring-1 ring-slate-200 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search student details..."
            className="pl-11 h-12 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
              <SelectValue placeholder="Select Slot" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL" className="rounded-lg">
                All Slots
              </SelectItem>
              {Array.isArray(slotsData) &&
                (slotsData as Slot[]).map((s) => (
                  <SelectItem key={s._id} value={s._id} className="rounded-lg">
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[150px] rounded-xl shadow-sm font-medium border-slate-200 bg-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="ALL" className="rounded-lg">
                All Status
              </SelectItem>
              <SelectItem value="ACTIVE" className="rounded-lg">
                Active
              </SelectItem>
              <SelectItem value="INACTIVE" className="rounded-lg">
                Inactive
              </SelectItem>
              <SelectItem value="ARCHIVED" className="rounded-lg">
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 4. MAIN REGISTRY */}
      <Card className="border-none shadow-xl rounded-[32px] overflow-hidden ring-1 ring-slate-200 bg-white">
        {/* MOBILE VIEW */}
        <div className="block md:hidden divide-y divide-slate-50">
          {!studentsData?.students?.length ? (
            <EmptyState />
          ) : (
            studentsData.students.map((student: Student) => (
              <div key={student._id || student.id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-tight">
                        {student.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                        Slot:{" "}
                        {typeof student.slotId === "object"
                          ? student.slotId?.name
                          : student.slotId || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-md text-[8px] font-black uppercase tracking-widest ${getStatusStyles(student.status || "INACTIVE")}`}
                  >
                    {student.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl ring-1 ring-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5">
                      <Mail size={10} /> {student.email}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5">
                      <Phone size={10} /> {student.phone}
                    </p>
                  </div>
                  <ActionDropdown
                    student={student}
                    onArchive={(s: Student) =>
                      setArchiveDialog({ open: true, student: s })
                    }
                    navigate={navigate}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="py-5 px-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Student Profile
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Contact
                </TableHead>
                <TableHead className="text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </TableHead>
                <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Slot
                </TableHead>
                <TableHead className="text-right pr-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {!studentsData?.students?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                studentsData.students.map((student: Student) => (
                  <TableRow
                    key={student._id || student.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-300" />{" "}
                          {student.email}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-300" />{" "}
                          {student.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(student.status || "INACTIVE")}`}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LayoutGrid size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">
                          {typeof student.slotId === "object"
                            ? student.slotId?.name
                            : student.slotId || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ActionDropdown
                        student={student}
                        onArchive={(s: Student) =>
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

      {/* 5. PAGINATION */}
      {studentsData?.pagination &&
        studentsData.pagination.total > studentsData.pagination.limit && (
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
            <div className="flex gap-1">
              <span className="h-10 min-w-[40px] flex items-center justify-center bg-white ring-1 ring-slate-200 rounded-xl text-xs font-black text-slate-900 shadow-sm">
                {currentPage}
              </span>
              <span className="h-10 flex items-center px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">
                of {studentsData.pagination.pages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-10 px-4 font-bold text-xs gap-2"
              disabled={currentPage >= studentsData.pagination.pages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        )}

      {/* ARCHIVE DIALOG */}
      <Dialog
        open={archiveDialog.open}
        onOpenChange={(open) => setArchiveDialog((p) => ({ ...p, open }))}
      >
        <DialogContent className="w-[92vw] max-w-[400px] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl bg-white outline-none [&>button]:hidden">
          <DialogHeader className="p-8 pb-0 text-center">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-rose-50/50">
              <Archive className="h-8 w-8 text-rose-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
              Archive Student
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium">
              This will deactivate <b>{archiveDialog.student?.name}</b>.
              Profiles can be restored from the central archive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-8 pt-6 flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold text-slate-400 h-12"
              onClick={() => setArchiveDialog({ open: false, student: null })}
            >
              Cancel
            </Button>
            <Button
              className="flex-[2] rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white h-12 shadow-lg shadow-rose-100 uppercase tracking-widest text-[10px]"
              disabled={archiveMutation.isPending}
              onClick={() => {
                const id =
                  archiveDialog.student?._id || archiveDialog.student?.id;
                if (id) archiveMutation.mutate(id);
              }}
            >
              {archiveMutation.isPending ? "Processing..." : "Confirm Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- INTERNAL HELPERS ---
const getStatusStyles = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "INACTIVE":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "ARCHIVED":
      return "bg-slate-50 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-400 border-slate-200";
  }
};

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
      className="rounded-2xl p-1.5 border-slate-100 shadow-2xl"
    >
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="gap-2.5 font-bold text-xs rounded-xl cursor-pointer py-2.5"
          onClick={() =>
            navigate(`/admin/students/${student._id || student.id}`)
          }
        >
          Edit Profile
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
      <Users className="h-12 w-12 text-slate-200" />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
      No Matching Records Found
    </p>
  </div>
);

export default AdminStudentsListPage;
