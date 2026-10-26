// src/features/auth/pages/RegisterPage.tsx
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { useRegister } from "../hooks/useRegister";
import { registerSchema } from "../schemas/register.schema";
import type { RegisterFormData } from "../schemas/register.schema";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#F5F6F8]">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          Join the platform built for performance and start managing your
          training with confidence.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              placeholder="Hosam Mohamed"
              className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.name
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-[#EF4444]">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              placeholder="athlete@example.com"
              className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.email
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
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
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              placeholder="Minimum 8 characters"
              className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#91A0B5] hover:text-[#F5F6F8] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder="Re-enter your password"
              className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.confirmPassword
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#EF4444]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Register Primary Button */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-6 flex h-[50px] w-full items-center justify-center rounded-[22px] bg-[#4FE080] text-sm font-bold tracking-wider text-[#0B0D10] uppercase transition-all duration-200 hover:bg-[#43D474] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B0D10]" />
              CREATING ACCOUNT...
            </>
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#252B33]" />
        </div>
        <div className="relative bg-[#0B0D10] px-3 text-[11px] font-medium tracking-wider text-[#64748B] uppercase">
          OR
        </div>
      </div>

      {/* Google Authentication - Completely Outside Form */}
      <div className="w-full">
        <GoogleAuthButton mode="signup" disabled={registerMutation.isPending} />
      </div>

      {/* Sign In Link */}
      <div className="mt-7 text-center text-[13px] text-[#91A0B5]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#4FE080] hover:text-[#43D474] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
