import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
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
import { Mail, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { useRequestStudentOtp } from "../hooks/useStudentAuth";

const schema = z.object({
  email: z.string().email({ message: "Institutional email required." }),
});

type FormValues = z.infer<typeof schema>;

const StudentResendOtpForm: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, status, error } = useRequestStudentOtp();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (formData: FormValues) => {
    mutate(
      { email: formData.email, purpose: "VERIFY" },
      {
        onSuccess: () => {
          // Navigate to verify OTP page, optionally pass email
          navigate("/student/verify-otp", { state: { email: formData.email } });
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-4 mb-8 text-center animate-in fade-in duration-500">
        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-blue-50">
          <ArrowRight size={24} className="text-white" />
        </div>
        <div className="text-left leading-none">
          <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase italic">
            Resend OTP<span className="text-blue-600">.</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
            Get a new code
          </p>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 bg-white p-7 sm:p-10 rounded-[36px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Identity Mail
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                      size={16}
                    />
                    <Input
                      placeholder="name@univ.edu"
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600 font-bold text-xs"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 ml-1" />
              </FormItem>
            )}
          />
          <div className="min-h-[20px] mt-1">
            {error && (
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert size={12} className="text-rose-600 shrink-0" />
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-tighter leading-tight">
                  {(error as import("axios").AxiosError<{ message?: string }>)
                    ?.response?.data?.message || "Resend OTP Error"}
                </p>
              </div>
            )}
            {status === "success" && (
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 mt-2">
                <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter leading-tight">
                  OTP sent to your email.
                </p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={status === "pending"}
            className="w-full h-11 bg-slate-950 hover:bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-slate-100 group mt-2"
          >
            {status === "pending" ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Resend OTP
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            )}
          </Button>
          <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-50 text-center">
            <Link
              to="/student/verify-otp"
              className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Go to Verify OTP
            </Link>
            <Link
              to="/student/login"
              className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-950"
            >
              Return to Login Node
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentResendOtpForm;
