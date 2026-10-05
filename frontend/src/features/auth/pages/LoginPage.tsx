// src/features/auth/pages/LoginPage.tsx
import { Mail, Lock, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { useLogin } from "../hooks/useLogin";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../schemas/login.schema";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {/* Header */}
      <div className="mb-8 mt-12 lg:mt-0">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-[#9CA3AF] leading-relaxed">
          Sign in to access your workspace and continue managing your training
          with confidence.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-[#9CA3AF]"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`h-12 w-full rounded-lg border bg-[#101418] pl-11 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
              }`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-[#9CA3AF]"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={`h-12 w-full rounded-lg border bg-[#101418] pl-11 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
              }`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="remember"
              className="border-[#6B7280] data-[state=checked]:bg-[#5BE584] data-[state=checked]:text-[#090B0F] data-[state=checked]:border-[#5BE584]"
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            >
              Remember me
            </Label>
          </div>

          <button
            type="button"
            className="text-xs font-medium text-[#5BE584] transition-colors hover:text-[#4ade80]"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#5BE584] text-sm font-bold tracking-wide text-[#090B0F] transition-all hover:bg-[#4ade80] hover:shadow-[0_0_20px_rgba(91,229,132,0.2)] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#090B0F]" />
              Signing In...
            </>
          ) : (
            "SIGN IN"
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-[#1E2329]" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">
            Or
          </span>
          <div className="h-px flex-1 bg-[#1E2329]" />
        </div>

        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          className="flex h-12 w-full items-center justify-center rounded-lg border border-[#1E2329] bg-[#101418] text-sm font-medium text-[#9CA3AF] transition-all hover:border-[#6B7280] hover:text-white hover:bg-[#161B22]"
        >
          <FcGoogle className="mr-3 h-5 w-5" />
          Continue with Google
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-xs text-[#6B7280] pt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#5BE584] transition-colors hover:text-[#4ade80]"
          >
            Create one now
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
