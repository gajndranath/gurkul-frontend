import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  Badge,
  Input,
  Select,
} from "../../components/ui";
import { useToast } from "../../hooks/useToast";
import { useDebounce } from "../../hooks/useDebounce";
import { getStudents, archiveStudent } from "../../api/studentsApi";
import { getAllSlots } from "../../api/slotApi";
import type { Student } from "./types";

const ITEMS_PER_PAGE = 10;

const StudentsListPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Filters & search
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

  // Fetch students
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
      return res.data;
    },
  });

  // Fetch slots for filter
  const { data: slotsData } = useQuery({
    queryKey: ["slots"],
    queryFn: getAllSlots,
  });

  // Archive mutation
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

  // Memo stats
  const statusCounts = useMemo(() => {
    if (!studentsData?.students)
      return { total: 0, active: 0, inactive: 0, archived: 0 } as {
        total: number;
        active: number;
        inactive: number;
        archived: number;
      };
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

  // Clear filters
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
      {/* Stats Cards */}
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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search by name, email, phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            options={
              Array.isArray(slotsData)
                ? slotsData.map((slot: { _id: string; name: string }) => ({
                    value: slot._id,
                    label: slot.name,
                  }))
                : []
            }
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
          />
          <Select
            options={[
              { value: "ALL", label: "All Status" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </CardContent>
      </Card>
      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsData && studentsData.data.length === 0 ? (
            <div className="text-gray-400">No students found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Slot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentsData &&
                  studentsData.data.map((student: Student) => (
                    <tr key={student.id} className="border-b">
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        <Badge
                          variant={
                            student.status === "ACTIVE"
                              ? "default"
                              : student.status === "ARCHIVED"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td>
                        {typeof student.slotId === "object"
                          ? student.slotId.name
                          : student.slotId}
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setArchiveDialog({ open: true, student: student })
                          }
                        >
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {/* Archive Dialog */}
      <Dialog
        open={archiveDialog.open}
        onOpenChange={(open) =>
          setArchiveDialog({ open, student: archiveDialog.student })
        }
      >
        <DialogContent>
          <div className="font-semibold mb-2">Archive Student</div>
          <div className="mb-4">
            Are you sure you want to archive{" "}
            <span className="font-bold">
              {archiveDialog.student ? archiveDialog.student.name : ""}
            </span>
            ?
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setArchiveDialog({ open: false, student: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                archiveDialog.student &&
                archiveMutation.mutate(archiveDialog.student.id)
              }
              disabled={archiveMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsListPage;
