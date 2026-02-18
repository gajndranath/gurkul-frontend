import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/useToast";
import { useDebounce } from "../../hooks/useDebounce";
import { getStudents, archiveStudent } from "../../api/adminStudentsApi";
import { getAllSlots } from "../../api/slotApi";
import type { Student } from "./types";

interface Slot {
  _id: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const StudentsListPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
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

  const { data: studentsData, isLoading } = useQuery({
    queryKey: [
      "students",
      debouncedSearchQuery,
      statusFilter,
      slotFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = {
        query: debouncedSearchQuery || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        slotId: slotFilter !== "ALL" ? slotFilter : undefined,
      };
      const res = await getStudents(params);
      return res;
    },
  });

  const { data: slotsData } = useQuery({
    queryKey: ["slots"],
    queryFn: getAllSlots,
  });

  const archiveMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await archiveStudent(studentId, "Archived from student list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student archived successfully");
      setArchiveDialog({ open: false, student: null });
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to archive student");
    },
  });

  const statusCounts = useMemo(() => {
    if (!studentsData?.students)
      return { total: 0, active: 0, inactive: 0, archived: 0 };
    return {
      total: studentsData.pagination?.total || 0,
      active: studentsData.students.filter(
        (s: Student) => s.status === "ACTIVE",
      ).length,
      inactive: studentsData.students.filter(
        (s: Student) => s.status === "INACTIVE",
      ).length,
      archived: studentsData.students.filter(
        (s: Student) => s.status === "ARCHIVED",
      ).length,
    };
  }, [studentsData]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSlotFilter("ALL");
    setCurrentPage(1);
  };

  if (isLoading) return <div className="p-4">Loading students...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student registrations and information
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["students"] })
          }
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">Total: {statusCounts.total}</CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Active: {statusCounts.active}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Inactive: {statusCounts.inactive}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            Archived: {statusCounts.archived}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />

          {/* Pure Shadcn Select for Slots */}
          <Select value={slotFilter} onValueChange={setSlotFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Slots</SelectItem>
              {Array.isArray(slotsData) &&
                slotsData.map(
                  (
                    slot: Slot, // <--- Use Slot instead of any
                  ) => (
                    <SelectItem key={slot._id} value={slot._id}>
                      {slot.name}
                    </SelectItem>
                  ),
                )}
            </SelectContent>
          </Select>

          {/* Pure Shadcn Select for Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {!studentsData?.students || studentsData.students.length === 0 ? (
            <div className="text-gray-400">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Slot</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.students.map((student: Student) => (
                    <tr key={student.id} className="border-b">
                      <td className="py-2">{student.name}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            student.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {typeof student.slotId === "object"
                          ? student.slotId?.name
                          : "N/A"}
                      </td>
                      <td className="py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setArchiveDialog({ open: true, student })
                          }
                        >
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={archiveDialog.open}
        onOpenChange={(open) =>
          setArchiveDialog({ open, student: archiveDialog.student })
        }
      >
        <DialogContent>
          <div className="font-semibold mb-2 text-lg">Archive Student</div>
          <p className="mb-4">
            Are you sure you want to archive{" "}
            <span className="font-bold">{archiveDialog.student?.name}</span>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setArchiveDialog({ open: false, student: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={archiveMutation.isPending}
              onClick={() =>
                archiveDialog.student &&
                archiveMutation.mutate(archiveDialog.student.id)
              }
            >
              {archiveMutation.isPending ? "Archiving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsListPage;
