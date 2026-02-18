import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";

import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Mail,
  ArrowRight,
  UserCircle,
  AlertCircle,
} from "lucide-react";

import { useLoginAdmin } from "../hooks/useAdminAuth";
import { useSessionStore } from "../../../stores/sessionStore";

const schema = z.object({
  email: z.string().email({ message: "Invalid credentials." }),
  password: z.string().min(6, { message: "Security key too short." }),
});

type FormValues = z.infer<typeof schema>;

const AdminLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, status, error } = useLoginAdmin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormValues) => {
    useSessionStore.getState().setRememberMe(rememberMe);
    mutate(data, {
      onSuccess: () => navigate("/admin/dashboard", { replace: true }),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-8 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TIGHTER BRANDING - Reduced height */}
      <div className="flex items-center justify-center gap-3 mb-6 text-center animate-in fade-in duration-500">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div className="text-left leading-none">
          <h2 className="text-lg font-black text-slate-950 tracking-tighter uppercase italic">
            Admin Registry<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">
            Authorized Node
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] relative"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Terminal ID
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600"
                      size={16}
                    />
                    <Input
                      placeholder="admin@gurukul.com"
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-xs font-bold"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 ml-1" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Access Key
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <LockKeyhole
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600"
                      size={16}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white text-xs font-bold"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 ml-1" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="h-4 w-4 rounded-md border-slate-200"
              />
              <label
                htmlFor="remember"
                className="text-[10px] font-black text-slate-500 uppercase tracking-tighter cursor-pointer"
              >
                Remember
              </label>
            </div>
            {/* Optional "Forgot" link could go here if needed */}
            <Link
              to="/admin/forgot-password"
              className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error Section */}
          {error && (
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
              <AlertCircle size={12} className="text-rose-600 shrink-0" />
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-tighter truncate">
                Access Denied: Check Credentials
              </p>
            </div>
          )}

          {/* THE BUTTON */}
          <Button
            type="submit"
            disabled={status === "pending"}
            className="w-full h-11 bg-slate-950 hover:bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-slate-100"
          >
            {status === "pending" ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight size={14} />
              </span>
            )}
          </Button>

          {/* FOOTER */}
          <Link
            to="/student/login"
            className="flex items-center justify-center gap-2 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all"
          >
            <UserCircle size={14} />
            <span>Student Node</span>
          </Link>
        </form>
      </Form>
    </div>
  );
};

export default AdminLoginForm;
