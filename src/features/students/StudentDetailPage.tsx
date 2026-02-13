import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
} from "../../components/ui";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { useToast } from "../../hooks/useToast";
import {
  getStudent,
  archiveStudent,
  reactivateStudent,
} from "../../api/studentsApi";

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [reactivateDialog, setReactivateDialog] = useState(false);

  // Fetch student details
  const { data: studentData, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => getStudent(id!),
  });

  // ...existing code...

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      await archiveStudent(id!, "Archived from detail page");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      toast.success("Student archived successfully");
      setArchiveDialog(false);
      navigate("/students");
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to archive student");
    },
  });

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      await reactivateStudent(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      toast.success("Student reactivated successfully");
      setReactivateDialog(false);
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to reactivate student");
    },
  });

  if (isLoading) return <div className="p-4">Loading student...</div>;
  if (!studentData)
    return <div className="p-4 text-gray-400">Student not found.</div>;

  const student = studentData;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/students")}>
        Back to Students
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{student.name}</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div>Email: {student.email}</div>
          <div>Phone: {student.phone}</div>
          <div>Father: {student.fatherName}</div>
          <div>Address: {student.address}</div>
          <div>Seat: {student.seatNumber}</div>
          <div>
            Slot:{" "}
            {typeof student.slotId === "object"
              ? student.slotId.name
              : student.slotId}
          </div>
          <div>Monthly Fee: ₹{student.monthlyFee}</div>
        </CardContent>
      </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger
            value="overview"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger value="fees" onClick={() => setActiveTab("fees")}>
            Fees
          </TabsTrigger>
          <TabsTrigger value="details" onClick={() => setActiveTab("details")}>
            Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" activeTab={activeTab}>
          {<div>Overview content here</div>}
        </TabsContent>
        <TabsContent value="fees" activeTab={activeTab}>
          {<div>Fee summary content here</div>}
        </TabsContent>
        <TabsContent value="details" activeTab={activeTab}>
          {<div>Details content here</div>}
        </TabsContent>
      </Tabs>
      {/* Archive Dialog */}
      <Dialog open={archiveDialog} onOpenChange={setArchiveDialog}>
        <DialogContent>
          <div className="font-semibold mb-2">Archive Student</div>
          <div className="mb-4">
            Are you sure you want to archive{" "}
            <span className="font-bold">{student.name}</span>?
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setArchiveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Reactivate Dialog */}
      <Dialog open={reactivateDialog} onOpenChange={setReactivateDialog}>
        <DialogContent>
          <div className="font-semibold mb-2">Reactivate Student</div>
          <div className="mb-4">
            Are you sure you want to reactivate{" "}
            <span className="font-bold">{student.name}</span>?
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setReactivateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => reactivateMutation.mutate()}
              disabled={reactivateMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
