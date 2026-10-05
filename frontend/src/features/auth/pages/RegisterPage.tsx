import { Mail, Lock, User, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { useRegister } from "../hooks/useRegister";
import { registerSchema } from "../schemas/register.schema";
import type { RegisterFormData } from "../schemas/register.schema";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useRegister();

  const onSubmit = ({ name, email, password }: RegisterFormData) => {
    registerMutation.mutate({
      name,
      email,
      password,
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {/* Header */}
      <div className="mb-8 mt-12 lg:mt-0">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-[#9CA3AF] leading-relaxed">
          Join the platform built for performance and start managing your
          training with confidence.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-semibold text-[#9CA3AF]"
          >
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              className={`h-12 w-full rounded-lg border bg-[#101418] pl-11 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.name
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
              }`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-red-400 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

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
              autoComplete="email"
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
              autoComplete="new-password"
              placeholder="Create a password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-[#9CA3AF]"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={`h-12 w-full rounded-lg border bg-[#101418] pl-11 pr-4 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.confirmPassword
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
              }`}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#5BE584] text-sm font-bold tracking-wide text-[#090B0F] transition-all hover:bg-[#4ade80] hover:shadow-[0_0_20px_rgba(91,229,132,0.2)] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#090B0F]" />
              Creating Account...
            </>
          ) : (
            "CREATE ACCOUNT"
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

        {/* Google Signup */}
        <Button
          type="button"
          variant="outline"
          className="flex h-12 w-full items-center justify-center rounded-lg border border-[#1E2329] bg-[#101418] text-sm font-medium text-[#9CA3AF] transition-all hover:border-[#6B7280] hover:text-white hover:bg-[#161B22]"
        >
          <FcGoogle className="mr-3 h-5 w-5" />
          Sign up with Google
        </Button>

        {/* Login Link */}
        <div className="text-center text-xs text-[#6B7280] pt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#5BE584] transition-colors hover:text-[#4ade80]"
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
