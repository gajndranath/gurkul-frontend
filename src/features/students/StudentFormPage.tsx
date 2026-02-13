import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form"; // 1. Import useWatch
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, Input, Select, Button } from "../../components/ui";
import { useToast } from "../../hooks/useToast";
import {
  registerStudent,
  updateStudent,
  getStudent,
} from "../../api/studentsApi";
import { getAllSlots } from "../../api/slotApi";
import * as z from "zod";

const studentFormSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  slotId: z.string().min(1, "Please select a slot"),
  seatNumber: z.string().optional(),
  monthlyFee: z.number().min(0),
  joiningDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { data: slotsData } = useQuery({
    queryKey: ["slots"],
    queryFn: getAllSlots,
  });

  const { data: studentData } = useQuery({
    queryKey: ["student", id],
    queryFn: () => (id ? getStudent(id) : null),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control, // 2. Destructure control
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      fatherName: "",
      slotId: "",
      seatNumber: "",
      monthlyFee: 0,
      joiningDate: new Date().toISOString().split("T")[0],
      notes: "",
      tags: [],
    },
  });

  // 3. Use standalone useWatch hook.
  // This is compatible with the React Compiler's memoization rules.
  const selectedSlotId = useWatch({
    control,
    name: "slotId",
  });

  useEffect(() => {
    if (selectedSlotId && Array.isArray(slotsData) && !isEditMode) {
      const selectedSlot = slotsData.find(
        (slot: { _id: string; monthlyFee: number }) =>
          slot._id === selectedSlotId,
      );
      if (selectedSlot) {
        setValue("monthlyFee", selectedSlot.monthlyFee, { shouldDirty: true });
      }
    }
  }, [selectedSlotId, slotsData, isEditMode, setValue]);

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
        monthlyFee: studentData.monthlyFee ?? 0,
        joiningDate: studentData.joiningDate
          ? new Date(studentData.joiningDate).toISOString().split("T")[0]
          : "",
        notes: studentData.notes || "",
        tags: studentData.tags || [],
      });
    }
  }, [studentData, isEditMode, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const formData = {
        ...data,
        monthlyFee: Number(data.monthlyFee),
        joiningDate: data.joiningDate
          ? new Date(data.joiningDate + "T00:00:00.000Z").toISOString()
          : new Date().toISOString(),
      };

      if (isEditMode && id) {
        await updateStudent(id, formData);
        toast.success("Student updated successfully");
      } else {
        await registerStudent(formData);
        toast.success("Student registered successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["students"] });
      navigate("/students");
    } catch (error) {
      const errMsg = (error as Error)?.message || "Failed to save student";
      toast.error(errMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input placeholder="Name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Address" {...register("address")} />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Father Name" {...register("fatherName")} />
              {errors.fatherName && (
                <p className="text-red-500 text-xs">
                  {errors.fatherName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Select
                options={
                  Array.isArray(slotsData)
                    ? slotsData.map((slot: { _id: string; name: string }) => ({
                        value: slot._id,
                        label: slot.name,
                      }))
                    : []
                }
                value={selectedSlotId || ""}
                onChange={(e) => setValue("slotId", e.target.value)}
              />
              {errors.slotId && (
                <p className="text-red-500 text-xs">{errors.slotId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Seat Number" {...register("seatNumber")} />
              {errors.seatNumber && (
                <p className="text-red-500 text-xs">
                  {errors.seatNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Monthly Fee"
                type="number"
                {...register("monthlyFee", { valueAsNumber: true })}
              />
              {errors.monthlyFee && (
                <p className="text-red-500 text-xs">
                  {errors.monthlyFee.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Joining Date"
                type="date"
                {...register("joiningDate")}
              />
              {errors.joiningDate && (
                <p className="text-red-500 text-xs">
                  {errors.joiningDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Notes" {...register("notes")} />
              {errors.notes && (
                <p className="text-red-500 text-xs">{errors.notes.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" variant="default">
              {isEditMode ? "Update Student" : "Register Student"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFormPage;
