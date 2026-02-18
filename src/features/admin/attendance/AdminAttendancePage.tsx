import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDailyAttendance,
  markAttendance,
  type AttendanceRecord,
} from "./api/attendanceApi";
import { useToast } from "../../../hooks/useToast";
import { Loader2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const AdminAttendancePage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Fetch Attendance
  const { data, isLoading } = useQuery({
    queryKey: ["dailyAttendance", selectedDate],
    queryFn: () => fetchDailyAttendance(selectedDate),
  });

  // Mark Attendance Mutation
  const markMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      // Optimistically update or invalidate. For simplicity, invalidate.
      queryClient.invalidateQueries({ queryKey: ["dailyAttendance", selectedDate] });
      success("Attendance Updated", "Student status has been recorded.");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toastError("Error", err.response?.data?.message || "Failed to mark attendance");
    },
  });

  const handleStatusChange = (studentId: string, newStatus: string) => {
    markMutation.mutate({
      studentId,
      date: selectedDate,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            Manage daily student attendance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-500" size={20} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStudents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.presentCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.absentCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Log: {format(new Date(selectedDate), "PPP")}</CardTitle>
          <CardDescription>
            Mark attendance for each student. Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data?.records?.length ? (
            <div className="text-center py-10 text-muted-foreground">
              No active students found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Seat / Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((record: AttendanceRecord) => (
                  <TableRow key={record.studentId}>
                    <TableCell className="font-medium">
                        {record.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {record.seatNumber || "-"} ({record.shift || "-"})
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={record.status}
                        onValueChange={(val) =>
                          handleStatusChange(record.studentId, val)
                        }
                        disabled={markMutation.isPending}
                      >
                        <SelectTrigger 
                            className={`w-[140px] ${
                                record.status === "PRESENT" ? "text-green-600 border-green-200 bg-green-50" :
                                record.status === "ABSENT" ? "text-red-600 border-red-200 bg-red-50" :
                                record.status === "HALF_DAY" ? "text-orange-600 border-orange-200 bg-orange-50" :
                                ""
                            }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOT_MARKED">Not Marked</SelectItem>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       {/* Future: Add Time Input Dialog */}
                       {record.checkInTime ? (
                         <div className="flex items-center gap-1">
                            <Clock size={12} />
                            In: {format(new Date(record.checkInTime), "hh:mm a")}
                         </div>
                       ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendancePage;
