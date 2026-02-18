import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Pure Shadcn UI Imports
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

// Hooks & API
import { useToast } from "../../hooks/useToast";
import {
  registerStudent,
  updateStudent,
  getStudent,
} from "../../api/studentsAdminApi";
import { getAllSlots } from "../../api/slotApi";

// Types
import * as z from "zod";
import type { Student } from "./types";

interface Slot {
  _id: string;
  name: string;
  monthlyFee: number;
}

const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  slotId: z.string().min(1, "Please select a slot"),
  seatNumber: z.string().optional(),
  monthlyFee: z.number().min(0, "Fee cannot be negative"),
  joiningDate: z.string().optional(),
  notes: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // 1. Strictly typed Queries
  const { data: slotsData } = useQuery<Slot[]>({
    queryKey: ["slots"],
    queryFn: getAllSlots,
  });

  const { data: studentData, isLoading: isStudentLoading } = useQuery<Student>({
    queryKey: ["student", id],
    queryFn: () => (id ? getStudent(id) : Promise.reject("No ID")),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      monthlyFee: 0,
      slotId: "",
      joiningDate: new Date().toISOString().split("T")[0],
    },
  });

  // 2. Watch slotId to auto-update the monthlyFee
  const selectedSlotId = useWatch({ control, name: "slotId" });

  useEffect(() => {
    if (selectedSlotId && Array.isArray(slotsData) && !isEditMode) {
      const selectedSlot = slotsData.find(
        (s: Slot) => s._id === selectedSlotId,
      );
      if (selectedSlot) {
        setValue("monthlyFee", selectedSlot.monthlyFee, { shouldDirty: true });
      }
    }
  }, [selectedSlotId, slotsData, isEditMode, setValue]);

  // 3. Populate form on edit
  useEffect(() => {
    if (studentData && isEditMode) {
      reset({
        name: studentData.name,
        phone: studentData.phone,
        email: studentData.email || "",
        address: studentData.address || "",
        fatherName: studentData.fatherName || "",
        slotId:
          typeof studentData.slotId === "string"
            ? studentData.slotId
            : studentData.slotId?._id || "",
        seatNumber: studentData.seatNumber || "",
        monthlyFee: studentData.monthlyFee || 0,
        joiningDate: studentData.joiningDate?.split("T")[0] || "",
        notes: studentData.notes || "",
      });
    }
  }, [studentData, isEditMode, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (isEditMode && id) {
        await updateStudent(id, data);
        toast.success("Student updated successfully");
      } else {
        await registerStudent(data);
        toast.success("Student registered successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["students"] });
      navigate("/students");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      toast.error(message);
    }
  };

  if (isEditMode && isStudentLoading)
    return <div className="p-10 text-center">Loading Student Data...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? "Edit Student" : "New Registration"}
        </h1>
        <Button variant="ghost" onClick={() => navigate("/students")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Personal & Admission Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && (
                <p className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="1234567890"
                />
                {errors.phone && (
                  <p className="text-destructive text-xs">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Slot Selection - Pure Shadcn via Controller */}
            <div className="space-y-2">
              <Label>Assigned Slot</Label>
              <Controller
                control={control}
                name="slotId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timing slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotsData?.map((slot: Slot) => (
                        <SelectItem key={slot._id} value={slot._id}>
                          {slot.name} (₹{slot.monthlyFee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.slotId && (
                <p className="text-destructive text-xs">
                  {errors.slotId.message}
                </p>
              )}
            </div>

            {/* Fee & Seat Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Monthly Fee</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  {...register("monthlyFee", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat #</Label>
                <Input
                  id="seatNumber"
                  {...register("seatNumber")}
                  placeholder="A-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional info..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update Records"
                  : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFormPage;
