// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useLogin } from "../hooks/useLogin";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../schemas/login.schema";
import { GoogleIcon } from "../components/GoogleIcon";

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleGoogleAuth = () => {
    toast.info("Google authentication is not configured for this environment.");
  };

  const handleForgotPassword = () => {
    toast.info(
      "Password recovery is not configured yet. Please contact your gym administrator.",
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#F5F6F8]">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          Sign in to access your workspace and continue managing your training
          with confidence.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A0B5]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              aria-invalid={!!errors.email}
              className="h-[52px] w-full rounded-[22px] border border-[#252B33] bg-[#171B20] pl-11 pr-4 text-sm text-[#F5F6F8] placeholder:text-[#64748B] focus:border-[#4FE080] focus:outline-none focus:ring-1 focus:ring-[#4FE080] transition-colors"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-[#EF4444]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91A0B5]" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className="h-[52px] w-full rounded-[22px] border border-[#252B33] bg-[#171B20] pl-11 pr-4 text-sm text-[#F5F6F8] placeholder:text-[#64748B] focus:border-[#4FE080] focus:outline-none focus:ring-1 focus:ring-[#4FE080] transition-colors"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-[#EF4444]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-[5px] border border-[#252B33] bg-[#171B20] accent-[#4FE080] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[13px] text-[#91A0B5] group-hover:text-[#F5F6F8] transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[13px] font-medium text-[#4FE080] hover:text-[#43D474] transition-colors cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign In Primary Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 flex h-[50px] w-full items-center justify-center rounded-[22px] bg-[#4FE080] text-sm font-bold tracking-wider text-[#0B0D10] uppercase transition-all duration-200 hover:bg-[#43D474] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B0D10]" />
              SIGNING IN...
            </>
          ) : (
            "SIGN IN"
          )}
        </button>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#252B33]" />
          </div>
          <div className="relative bg-[#0B0D10] px-3 text-[11px] font-medium tracking-wider text-[#64748B] uppercase">
            OR
          </div>
        </div>

        {/* Google Secondary Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[22px] border border-[#252B33] bg-[#171B20] text-sm font-medium text-[#F5F6F8] transition-colors hover:bg-[#1E232A] hover:border-[#333A44] cursor-pointer"
        >
          <GoogleIcon className="h-4 w-4" />
          <span>Continue with Google</span>
        </button>

        {/* Sign Up Link */}
        <div className="mt-7 text-center text-[13px] text-[#91A0B5]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#4FE080] hover:text-[#43D474] transition-colors"
          >
            Create one now
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
