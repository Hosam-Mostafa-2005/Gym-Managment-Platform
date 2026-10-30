// src/features/auth/pages/RegisterPage.tsx
import { useMemo, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, Dumbbell, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useRegister } from "../hooks/useRegister";
import { createRegisterSchema } from "../schemas/register.schema";
import type { RegisterFormData } from "../schemas/register.schema";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

const RegisterPage = () => {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRoleParam = searchParams.get("role")?.toLowerCase();
  const [isCoach, setIsCoach] = useState(
    initialRoleParam === "coach" || initialRoleParam === "trainer",
  );

  const schema = useMemo(() => createRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useRegister({ isCoach });

  const handleRoleToggle = (coachSelected: boolean) => {
    setIsCoach(coachSelected);
    if (coachSelected) {
      setSearchParams({ role: "coach" });
    } else {
      setSearchParams({});
    }
  };

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
        <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-[#F5F6F8]">
          {isCoach
            ? t("register.coachTitle", "Create Coach Account")
            : t("register.athleteTitle", "Create Account")}
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          {isCoach
            ? t(
                "register.coachSubtitle",
                "Join STREN as an independent coach to program workouts, manage athletes, and track progress.",
              )
            : t(
                "register.athleteSubtitle",
                "Join the platform built for performance and start managing your training with confidence.",
              )}
        </p>
      </div>

      {/* Account Type Selector (Testing Phase Independent Coach Self-Registration) */}
      <div className="mb-6 p-1 bg-[#12161D] border border-[#252B33] rounded-xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleRoleToggle(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isCoach
              ? "bg-[#1E252E] text-[#4FE080] shadow-sm border border-[#4FE080]/20"
              : "text-[#91A0B5] hover:text-[#F5F6F8] hover:bg-white/[0.02]"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>{t("register.roleAthlete", "Athlete")}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleToggle(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCoach
              ? "bg-[#1E252E] text-[#4FE080] shadow-sm border border-[#4FE080]/20"
              : "text-[#91A0B5] hover:text-[#F5F6F8] hover:bg-white/[0.02]"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{t("register.roleCoach", "Coach")}</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            {t("register.fullNameLabel", "Full Name")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              placeholder={
                isCoach
                  ? t("register.coachNamePlaceholder", "Coach Hosam Mohamed")
                  : t("register.athleteNamePlaceholder", "Hosam Mohamed")
              }
              className={`w-full h-11 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
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
            {t("register.emailLabel", "Email Address")}
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
              placeholder={
                isCoach
                  ? t("register.coachEmailPlaceholder", "coach@example.com")
                  : t("register.athleteEmailPlaceholder", "athlete@example.com")
              }
              className={`w-full h-11 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
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
            {t("register.passwordLabel", "Password")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              placeholder={t("register.passwordPlaceholder", "Minimum 8 characters")}
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
            <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[13px] font-medium text-[#F5F6F8] mb-1.5"
          >
            {t("register.confirmPasswordLabel", "Confirm Password")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-[#91A0B5]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder={t("register.confirmPasswordPlaceholder", "Re-enter your password")}
              className={`w-full h-11 pl-10 pr-10 rtl:pl-10 rtl:pr-10 rounded-xl border bg-[#171B20] text-sm text-[#F5F6F8] placeholder-[#91A0B5]/50 transition-colors focus:outline-none focus:ring-1 ${
                errors.confirmPassword
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
              <Loader2 className="mr-2 rtl:mr-0 rtl:ml-2 h-4 w-4 animate-spin text-[#0B0D10]" />
              {isCoach
                ? t("register.submittingCoach", "CREATING COACH ACCOUNT...")
                : t("register.submittingAthlete", "CREATING ATHLETE ACCOUNT...")}
            </>
          ) : isCoach ? (
            t("register.submitCoach", "CREATE COACH ACCOUNT")
          ) : (
            t("register.submitAthlete", "CREATE ATHLETE ACCOUNT")
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#252B33]" />
        </div>
        <div className="relative bg-[#0B0D10] px-3 text-[11px] font-medium tracking-wider text-[#64748B] uppercase">
          {t("register.orDivider", "OR")}
        </div>
      </div>

      {/* Google Authentication - Completely Outside Form */}
      <div className="w-full">
        <GoogleAuthButton mode="signup" disabled={registerMutation.isPending} />
      </div>

      {/* Sign In Link */}
      <div className="mt-7 text-center text-[13px] text-[#91A0B5]">
        {t("register.hasAccountPrompt", "Already have an account?")}{" "}
        <Link
          to="/login"
          className="font-semibold text-[#4FE080] hover:text-[#43D474] transition-colors"
        >
          {t("register.signInLink", "Sign in")}
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
