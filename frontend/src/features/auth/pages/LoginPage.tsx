import { Dumbbell, Mail, Lock } from "lucide-react";
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
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>

          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Sign in to access your dashboard and continue managing your gym with
            confidence.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6">
          {/* Email */}
          <div className="space-y-2 ">
            <Label htmlFor="email">Email Address</Label>

            <div className="relative">
              <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type="password"
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

          {/* Remember */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox id="remember" />

              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Remember me
              </Label>
            </div>

            <button
              type="button"
              className="text-sm font-medium text-primary transition-colors hover:text-amber-50"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
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
            Continue with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
