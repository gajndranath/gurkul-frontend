import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

// Standard Shadcn UI Imports
import { Button } from "../../../components/ui";
import { Input } from "../../../components/ui";
import { Checkbox } from "../../../components/ui/checkbox";
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
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ArrowRight,
  UserPlus,
  AlertCircle,
} from "lucide-react";

// Stores & Hooks
import { useLoginStudent, useRequestStudentOtp } from "../hooks/useStudentAuth";
import { useSessionStore } from "../../../stores/sessionStore";
import { useToast } from "../../../hooks/useToast";

const schema = z.object({
  email: z.string().email({ message: "Identity mail is required." }),
  password: z.string().min(6, { message: "Access key must be 6+ characters." }),
});

type FormValues = z.infer<typeof schema>;

const StudentLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { mutate, status, error } = useLoginStudent();
  const { mutate: requestOtp, status: otpStatus } = useRequestStudentOtp();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormValues) => {
    // Logic remains untouched
    useSessionStore.getState().setRememberMe(rememberMe);
    mutate(data, {
      onSuccess: () => navigate("/student/dashboard", { replace: true }),
    });
  };

  const onSetupPassword = () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Please enter your identity mail first.");
      return;
    }

    requestOtp(
      { email, purpose: "LOGIN" },
      {
        onSuccess: () => {
          toast.success("OTP sent for password setup.");
          navigate("/student/verify-otp", { state: { email } });
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to send OTP.");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-10">
      {/* BRANDING: Horizontal Compact Style to prevent scrolling */}
      <div className="flex items-center justify-center gap-4 mb-8 text-center animate-in fade-in duration-500">
        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-blue-50">
          <GraduationCap size={24} className="text-white" />
        </div>
        <div className="text-left leading-none">
          <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase italic">
            Student Node<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
            Gurukul Registry
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 bg-white p-7 sm:p-10 rounded-[36px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          {/* Registry Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />

          {/* Email Node */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Identity Mail
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                      size={18}
                    />
                    <Input
                      placeholder="name@university.edu"
                      className="pl-12 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white transition-all text-slate-900 font-bold"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-500 ml-1" />
              </FormItem>
            )}
          />

          {/* Password Node */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Access Key
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <LockKeyhole
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                      size={18}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white transition-all text-slate-900 font-bold"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-500 ml-1" />
              </FormItem>
            )}
          />

          {/* Options Row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2.5">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="h-5 w-5 rounded-lg border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor="remember"
                className="text-[11px] font-black text-slate-500 uppercase tracking-tighter cursor-pointer select-none"
              >
                Remember Node
              </label>
            </div>
          </div>

          {/* Operational Error Feed */}
          {error && (
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex flex-col gap-2 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter leading-tight">
                  {(error as AxiosError<{ message?: string }>)?.response?.data
                    ?.message || "Terminal Error: Access Denied"}
                </p>
              </div>
              
              {(error as AxiosError<{ message?: string }>)?.response?.data?.message?.includes("Password not set") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={otpStatus === "pending"}
                  onClick={onSetupPassword}
                  className="w-full h-8 border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {otpStatus === "pending" ? (
                    <div className="h-3 w-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                  ) : (
                    "Initialize Password Setup"
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            type="submit"
            disabled={status === "pending"}
            className="w-full h-12 sm:h-13 bg-slate-950 hover:bg-blue-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-slate-100 group"
          >
            {status === "pending" ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Login
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            )}
          </Button>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 mt-2 border-t border-slate-50 pt-4">
            <Link
              to="/student/register"
              className="flex items-center justify-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all"
            >
              <UserPlus size={16} /> New Enrollment
            </Link>
            <Link
              to="/admin/login"
              className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center hover:text-slate-900 transition-colors"
            >
              Switch to Administrator Node
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentLoginForm;
