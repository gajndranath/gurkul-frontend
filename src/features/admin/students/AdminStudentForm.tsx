import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus,
  UserCog,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
} from "lucide-react";

import { Card, CardContent, Button, Badge } from "../../../components/ui";
import { useToast } from "../../../hooks/useToast";
import {
  useSlots,
  useStudentMutations,
} from "./studentFormWidget/hook/studentHooks";
import { StudentFormProvider } from "./studentFormWidget/hook/StudentFormContext";
import {
  studentFormSchema,
  type StudentFormValues,
} from "./studentFormWidget/type/AdminStudentForm.types";

// Widgets
import PersonalInfoSection from "./studentFormWidget/widget/PersonalInfoSection";
import LibraryInfoSection from "./studentFormWidget/widget/LibraryInfoSection";
import AdditionalInfoSection from "./studentFormWidget/widget/AdditionalInfoSection";
import SummaryCard from "./studentFormWidget/widget/SummaryCard";
import QuickActionsCard from "./studentFormWidget/widget/QuickActionsCard";
import ImportantNotesCard from "./studentFormWidget/widget/ImportantNotesCard";

const AdminStudentForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: slotsData } = useSlots();
  const { registerStudent, updateStudent } = useStudentMutations();
  const isEditMode = Boolean(id);

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      slotId: "",
      monthlyFee: 0,
      email: "",
      address: "",
      fatherName: "",
      seatNumber: "",
      joiningDate: new Date().toISOString().split("T")[0], // Default to today
      notes: "",
      tags: [],
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, setValue, reset, control, formState } =
    methods;
  const { errors, isSubmitting } = formState;

  const selectedSlotId = useWatch({ control, name: "slotId" });
  const formValues = useWatch({ control });

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

      navigate("/admin/students");
    } catch (error) {
      const errMsg = (error as Error)?.message || "Failed to save student";
      toast.error(errMsg);
    }
  };

  return (
    <StudentFormProvider form={methods}>
      <div className="min-h-screen  bg-[#f8fafc] p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 1. HEADER SECTION */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/students")}
                className="group -ml-2 text-slate-500 hover:text-blue-600 transition-colors gap-2"
              >
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Directory
              </Button>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                  {isEditMode ? "Update Node" : "Registration Node"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                {isEditMode ? "Edit Profile" : "Register Student"}
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge
                variant="outline"
                className="hidden sm:flex rounded-xl px-4 py-2 bg-white border-slate-200 text-slate-500 gap-2 font-bold uppercase text-[10px] tracking-widest"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Live Validation Active
              </Badge>
            </div>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-6 lg:grid-cols-12 items-start"
          >
            {/* 2. LEFT COLUMN: Main Forms (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info Card */}
              <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-[24px] overflow-hidden bg-white transition-all hover:shadow-md">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      {isEditMode ? (
                        <UserCog size={18} />
                      ) : (
                        <UserPlus size={18} />
                      )}
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      Personal Details
                    </h2>
                  </div>
                  <PersonalInfoSection register={register} errors={errors} />
                </CardContent>
              </Card>

              {/* Library Config Card */}
              <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-[24px] overflow-hidden bg-white transition-all hover:shadow-md">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-4">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      Library Allocation
                    </h2>
                  </div>
                  <LibraryInfoSection
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    slotsData={slotsData}
                    selectedSlotId={selectedSlotId}
                  />
                </CardContent>
              </Card>

              {/* Additional Data Card */}
              <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-[24px] overflow-hidden bg-white transition-all hover:shadow-md">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                      <Plus size={18} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      Additional Metadata
                    </h2>
                  </div>
                  <AdditionalInfoSection
                    register={register}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 3. RIGHT COLUMN: Summary & Actions (4 Columns) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              {/* Live Summary Widget */}
              <SummaryCard
                formValues={formValues}
                selectedSlotId={selectedSlotId}
                slotsData={slotsData}
              />

              {/* Action Terminal */}
              <Card className="border-none shadow-xl ring-1 ring-slate-900 bg-slate-900 rounded-[24px] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                      Action Terminal
                    </p>
                    <h3 className="text-white font-bold text-lg tracking-tight">
                      Commit Changes
                    </h3>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Synchronizing...
                      </span>
                    ) : isEditMode ? (
                      "Update Profile"
                    ) : (
                      "Initialize Registration"
                    )}
                  </Button>

                  <QuickActionsCard
                    isEditMode={isEditMode}
                    id={id}
                    reset={reset}
                  />
                </CardContent>
              </Card>

              {/* Helpful Context */}
              <ImportantNotesCard />
            </aside>
          </form>
        </div>
      </div>
    </StudentFormProvider>
  );
};

export default AdminStudentForm;
