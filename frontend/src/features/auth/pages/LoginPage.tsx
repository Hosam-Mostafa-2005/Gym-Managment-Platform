// src/features/auth/pages/LoginPage.tsx
import { useMemo, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useLogin } from "../hooks/useLogin";
import { createLoginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../schemas/login.schema";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

const LoginPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#F5F6F8]">
          {t("login.title", "Welcome Back")}
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          {t(
            "login.subtitle",
            "Sign in to access your workspace and continue managing your training with confidence.",
          )}
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
            {t("login.emailLabel", "Email Address")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              {...register("email")}
              placeholder={t("login.emailPlaceholder", "athlete@example.com")}
              className={`w-full h-11 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.email
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-[#EF4444]">
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
            {t("login.passwordLabel", "Password")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              placeholder={t("login.passwordPlaceholder", "••••••••")}
              className={`w-full h-11 pl-10 pr-10 rtl:pl-10 rtl:pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#252B33] focus:border-[#4FE080] focus:ring-[#4FE080]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t("login.hidePassword", "Hide password")
                  : t("login.showPassword", "Show password")
              }
              className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pr-0 rtl:pl-3.5 flex items-center text-[#91A0B5] hover:text-[#F5F6F8] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[#EF4444]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me and Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-[5px] border border-[#252B33] bg-[#171B20] accent-[#4FE080] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[13px] text-[#91A0B5] group-hover:text-[#F5F6F8] transition-colors">
              {t("login.rememberMe", "Remember me")}
            </span>
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[13px] font-medium text-[#4FE080] hover:text-[#43D474] transition-colors cursor-pointer"
          >
            {t("login.forgotPassword", "Forgot Password?")}
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
              <Loader2 className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4 animate-spin text-[#0B0D10]" />
              {t("login.submittingButton", "SIGNING IN...")}
            </>
          ) : (
            t("login.submitButton", "SIGN IN")
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#252B33]" />
        </div>
        <div className="relative bg-[#0B0D10] px-3 text-[11px] font-medium tracking-wider text-[#64748B] uppercase">
          {t("login.orDivider", "OR")}
        </div>
      </div>

      {/* Google Authentication - Completely Outside Form */}
      <div className="w-full">
        <GoogleAuthButton mode="signin" disabled={loginMutation.isPending} />
      </div>

      {/* Sign Up Link */}
      <div className="mt-7 text-center text-[13px] text-[#91A0B5]">
        {t("login.noAccountPrompt", "Don't have an account?")}{" "}
        <Link
          to="/register"
          className="font-semibold text-[#4FE080] hover:text-[#43D474] transition-colors"
        >
          {t("login.createAccountLink", "Create one now")}
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
