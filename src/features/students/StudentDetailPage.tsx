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
import type { Student } from "./types";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [archiveOpen, setArchiveOpen] = useState(false);

  const { data: student, isLoading } = useQuery<Student>({
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
  if (!student) return <div className="p-8 text-center">Student not found</div>;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-muted-foreground">Phone</span>
              <span>{student.phone || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-muted-foreground">Slot</span>
              <span>
                {typeof student.slotId === "object"
                  ? student.slotId.name
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="details">Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p>Address: {student.address || "No address provided"}</p>
              <p>Father Name: {student.fatherName || "N/A"}</p>
            </CardContent>
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
