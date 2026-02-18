import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  requestSlotChange,
  fetchMySlotChangeHistory,
  fetchAllSlots,
} from "./api/studentSlotApi";
import { Loader2, Clock } from "lucide-react";

interface Slot {
  _id: string;
  name: string;
  timeRange: string;
  monthlyFee: number;
}

interface SlotRequest {
  _id: string;
  requestedSlotId: {
    _id: string;
    name: string;
    timeRange: string;
  };
  status: string;
  adminComments?: string;
  createdAt: string;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "@/hooks/useToast";

// Schema
const requestSchema = z.object({
  newSlotId: z.string().min(1, "Please select a slot"),
  reason: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const StudentSlotRequestPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ["activeSlots"],
    queryFn: fetchAllSlots,
  });

  const { data: history } = useQuery({
    queryKey: ["slotHistory"],
    queryFn: fetchMySlotChangeHistory,
  });

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: RequestFormValues) =>
      requestSlotChange(data.newSlotId, data.reason || ""),
    onSuccess: () => {
      success("Request Submitted", "Your slot change request has been sent for approval.");
      reset();
      queryClient.invalidateQueries({ queryKey: ["slotHistory"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toastError(
        "Error",
        err.response?.data?.message || "Failed to submit request"
      );
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Slot Change</h2>
          <p className="text-muted-foreground">
            Request a change to your study slot or view history.
          </p>
        </div>
      </div>

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Request New Slot</CardTitle>
              <CardDescription>
                Select a new preferred time slot. Admin approval required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Slot</label>
                  <Select
                    onValueChange={(val) => setValue("newSlotId", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSlots ? (
                        <div className="p-2 text-center text-sm">Loading...</div>
                      ) : (
                        slots?.map((slot: Slot) => (
                          <SelectItem key={slot._id} value={slot._id}>
                            {slot.name} ({slot.timeRange}) - ₹{slot.monthlyFee}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.newSlotId && (
                    <p className="text-sm text-red-500">{errors.newSlotId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason (Optional)</label>
                  <Input
                    placeholder="Why do you want to change?"
                    {...register("reason")}
                  />
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Past slot change requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {!history || history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No request history found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Requested Slot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admin Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((req: SlotRequest) => (
                      <TableRow key={req._id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-slate-400" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {req.requestedSlotId?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {req.requestedSlotId?.timeRange}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              req.status === "APPROVED"
                                ? "default"
                                : req.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                                req.status === "APPROVED" ? "bg-green-500" : ""
                            }
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {req.adminComments || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentSlotRequestPage;
