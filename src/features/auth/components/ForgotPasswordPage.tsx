import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../api/passwordResetApi";
import { useToast } from "../../../hooks/useToast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/ui/card";
import { Link } from "react-router-dom";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => forgotPassword(data.email),
    onSuccess: () => {
      success("Email Sent", "Check your inbox for the reset link.");
      setIsEmailSent(true);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toastError("Error", error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEmailSent ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  We have sent a password recover instructions to your email.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/admin/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button className="w-full" type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        {!isEmailSent && (
          <CardFooter className="flex justify-center">
            <Link
              to="/admin/login"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
