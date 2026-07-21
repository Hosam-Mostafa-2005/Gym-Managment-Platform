import { Dumbbell, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <div className="w-full max-w-lg">
      <div className="rounded-[32px] border border-border bg-card p-2 shadow-2xl shadow-black/20">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-background">
            <Dumbbell className="h-10 w-10" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>

          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Create your account to start managing your gym with confidence.
          </p>
        </div>

        {/* Form */}
        {/* FullName */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>

          <div className="relative">
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              className="h-14 rounded-xl pr-12 text-base"
              {...register("name")}
            />

            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6">
          {/* Email */}
          <div className="space-y-2 ">
            <Label htmlFor="email">Email Address</Label>

            <div className="relative">
              <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="h-14 rounded-xl pr-12 text-base"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                className="h-14 rounded-xl pr-12 text-base"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* ConfirmPassword */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="h-14 rounded-xl pr-12 text-base"
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="
    h-14
    w-full
    rounded-xl
    text-base
    font-semibold
    transition-all
    duration-200
    hover:scale-[1.01]
    active:scale-[0.99]
  "
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />

            <span className="text-sm text-muted-foreground">OR</span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="
              h-14
              w-full
              rounded-xl
              border-border
              text-base
              font-medium
              transition-all
              duration-200
              hover:bg-accent
            "
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Sign up with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
