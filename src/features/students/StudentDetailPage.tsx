import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { useToast } from "../../hooks/useToast";
import { getStudent, archiveStudent } from "../../api/studentsAdminApi";
import StudentFeeLedgerWidget from "../admin/fees/widgets/StudentFeeLedgerWidget";

import { formatCurrency } from "@/lib/utils";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [archiveOpen, setArchiveOpen] = useState(false);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["student", id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveStudent(id!, "Standard Archive"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      success("Student archived");
      setArchiveOpen(false);
      navigate("/students");
    },
    onError: (err: Error) => toastError(err.message),
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading details...</div>;
  if (!data || !data.student) return <div className="p-8 text-center">Student not found</div>;

  const { student, feeSummary } = data;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/students")}>
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/students/edit/${id}`)}
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setArchiveOpen(true)}>
            Archive
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{student.email}</p>
              {student.emailVerified && (
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={student.status === "ACTIVE" ? "default" : "secondary"}
            >
              {student.status}
            </Badge>
            {student.phoneVerified && (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                Phone Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Phone</span>
              <span className="font-bold">{student.phone || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Slot</span>
              <span className="font-bold">
                {typeof student.slotId === "object"
                  ? student.slotId?.name
                  : "N/A"}
              </span>
            </div>
            {/* FINANCIAL SUMMARY IN HEADER */}
            <div className="flex flex-col bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <span className="font-semibold text-emerald-700 uppercase text-[9px] tracking-widest">Total Paid</span>
              <span className="font-black text-emerald-900">{formatCurrency(feeSummary?.totals?.totalPaid || 0)}</span>
            </div>
            <div className="flex flex-col bg-rose-50 p-2 rounded-lg border border-rose-100">
              <span className="font-semibold text-rose-700 uppercase text-[9px] tracking-widest">Total Due</span>
              <span className="font-black text-rose-900">{formatCurrency(feeSummary?.totals?.totalDue || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg font-bold">Overview</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg font-bold">Fees & Payments</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg font-bold">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4 animate-in fade-in duration-300">
          <Card className="rounded-[24px] border-slate-200 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Address</span>
                <p className="font-medium">{student.address || "No address provided"}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Father Name</span>
                <p className="font-medium">{student.fatherName || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fees" className="mt-4 animate-in fade-in duration-300">
          <StudentFeeLedgerWidget studentId={id!} />
        </TabsContent>
        <TabsContent value="details" className="mt-4 animate-in fade-in duration-300">
           <Card className="rounded-[24px] border-slate-200 shadow-sm p-8 text-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Activity log coming soon...</p>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Archive</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to archive <strong>{student.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? "Archiving..." : "Confirm Archive"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
