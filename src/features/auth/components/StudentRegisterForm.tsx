import type { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";

// Shadcn UI Components
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";

// Icons
import {
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Users,
  ArrowRight,
  UserCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Hooks
import { useRegisterStudent } from "../hooks/useStudentAuth";

const schema = z.object({
  name: z
    .string()
    .min(2, { message: "Legal name required." })
    .max(100, { message: "Name too long." }),
  email: z.string().email({ message: "Invalid institutional email." }),
  phone: z.string().regex(/^\d{10}$/, { message: "Phone must be 10 digits." }),
  address: z.string().optional(),
  fatherName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const StudentRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, status, error, data } = useRegisterStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      fatherName: "",
    },
  });

  const onSubmit = (formData: FormValues) => {
    mutate(formData, {
      onSuccess: () => {
        navigate("/student/verify-otp", { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. BRANDING - Compact Header */}
      <div className="flex items-center justify-center gap-4 mb-8 text-center animate-in fade-in duration-500">
        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-blue-50">
          <UserPlus size={24} className="text-white" />
        </div>
        <div className="text-left leading-none">
          <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase italic">
            Student Enrollment<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
            New Registry Node
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 bg-white p-7 sm:p-10 rounded-[36px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          {/* Top Decorative Blue Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Legal Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <UserCircle
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                        size={18}
                      />
                      <Input
                        placeholder="Gajendra Tripathi"
                        className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold text-rose-500" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Identity Mail
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                        size={18}
                      />
                      <Input
                        placeholder="name@univ.edu"
                        className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold text-rose-500" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Primary Contact
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Phone
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                        size={18}
                      />
                      <Input
                        placeholder="9876543210"
                        className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold text-rose-500" />
                </FormItem>
              )}
            />

            {/* Father's Name */}
            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Guardian Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Users
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                        size={18}
                      />
                      <Input
                        placeholder="Optional"
                        className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Address - Full Width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Postal Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <MapPin
                          className="absolute left-3.5 top-4 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                          size={18}
                        />
                        <Input
                          placeholder="Full residential details"
                          className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* STATUS MESSAGES */}
          <div className="min-h-[20px]">
            {error && (
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter leading-tight">
                  Registry Error:{" "}
                  {(error as AxiosError<{ message?: string }>)?.response?.data
                    ?.message || "Validation Failed"}
                </p>
              </div>
            )}
            {data && (
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter leading-tight">
                  {data.data.message}
                </p>
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <Button
            type="submit"
            disabled={status === "pending"}
            className="w-full h-12 sm:h-14 bg-slate-950 hover:bg-blue-600 text-white rounded-[20px] font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-slate-100 group"
          >
            {status === "pending" ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Confirm Enrollment{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            )}
          </Button>

          {/* FOOTER NAVIGATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 border-t border-slate-50 pt-6">
            <Link
              to="/student/login"
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Existing Node? Login
            </Link>
            <div className="flex gap-4">
              <Link
                to="/student/verify-otp"
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950"
              >
                Verify OTP
              </Link>
              <Link
                to="/admin/login"
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950"
              >
                Admin Node
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentRegisterForm;
