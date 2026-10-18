import { Mail, Lock, User, Loader2 } from "lucide-react";
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
          Create Account
        </h2>
        <p className="mt-1.5 text-sm text-[#94A3B8] leading-relaxed">
          Join STREN to track workouts, assignments, and athletic progress.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-medium text-[#F8FAFC]">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              aria-invalid={!!errors.name}
              className="h-11 bg-[#090B0F] pl-10 pr-4"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-[#EF4444]">
              {errors.name.message}
            </p>
          )}
        </div>

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
              autoComplete="email"
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
              autoComplete="new-password"
              placeholder="Create a password"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-[#F8FAFC]"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              className="h-11 bg-[#090B0F] pl-10 pr-4"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-[#EF4444]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          size="lg"
          disabled={registerMutation.isPending}
          className="mt-2 w-full"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#090B0F]" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center text-xs text-[#94A3B8] pt-3 border-t border-[#2A3039]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#5BE584] transition-colors hover:text-[#49D472]"
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
