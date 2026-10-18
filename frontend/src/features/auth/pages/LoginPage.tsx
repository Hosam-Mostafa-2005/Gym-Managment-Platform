// src/features/auth/pages/LoginPage.tsx
import { Mail, Lock, Loader2 } from "lucide-react";
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
          Welcome Back
        </h2>
        <p className="mt-1.5 text-sm text-[#94A3B8] leading-relaxed">
          Sign in to access your STREN workspace and continue your training.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium text-[#F8FAFC]">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              className="h-11 bg-[#090B0F] pl-10 pr-4"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-[#EF4444]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-medium text-[#F8FAFC]"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className="h-11 bg-[#090B0F] pl-10 pr-4"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-[#EF4444]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              className="border-[#2A3039] data-[state=checked]:bg-[#5BE584] data-[state=checked]:text-[#090B0F] data-[state=checked]:border-[#5BE584]"
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Keep me signed in
            </Label>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          size="lg"
          disabled={loginMutation.isPending}
          className="mt-2 w-full"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#090B0F]" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-xs text-[#94A3B8] pt-3 border-t border-[#2A3039]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#5BE584] transition-colors hover:text-[#49D472]"
          >
            Create one now
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
