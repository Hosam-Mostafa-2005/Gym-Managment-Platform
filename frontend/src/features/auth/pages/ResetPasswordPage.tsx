// src/features/auth/pages/ResetPasswordPage.tsx
import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { resetPassword } from "../api/auth.api";

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resetToken =
    searchParams.get("resetToken") || searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      toast.error(
        t(
          "resetPassword.toastMissingToken",
          "Missing or expired reset token. Please request a new recovery code.",
        ),
      );
      navigate("/forgot-password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        t(
          "resetPassword.toastMinLength",
          "Password must be at least 8 characters long.",
        ),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        t("resetPassword.toastMismatch", "Passwords do not match."),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        resetToken,
        newPassword,
      });

      toast.success(res.message);
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        t(
          "resetPassword.toastFailed",
          "Password reset failed. Please restart the request.",
        );
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-[#5BE584] mb-5">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
          {t("resetPassword.successTitle", "Password Reset Complete!")}
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] max-w-sm mx-auto leading-relaxed">
          {t(
            "resetPassword.successDescription",
            "Your password has been successfully updated. All previous active sessions have been securely terminated.",
          )}
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] cursor-pointer"
          >
            {t("resetPassword.signInWithNewPassword", "Sign In with New Password")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs text-[#91A0B5] hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        {t("resetPassword.backToSignIn", "Back to Sign In")}
      </Link>

      <div className="mb-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-[#5BE584] mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
          {t("resetPassword.title", "Create New Password")}
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          {email ? (
            t("resetPassword.subtitleWithEmail", {
              email,
              defaultValue: "Setting new credentials for {{email}}.",
            })
          ) : (
            t(
              "resetPassword.subtitleDefault",
              "Enter a strong, secure password for your STREN account.",
            )
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
          >
            {t("resetPassword.newPasswordLabel", "New Password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("resetPassword.newPasswordPlaceholder", "Minimum 8 characters")}
              required
              minLength={8}
              className="w-full rounded-xl border border-[#1E2329] bg-[#0E1217] pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t("login.hidePassword", "Hide password")
                  : t("login.showPassword", "Show password")
              }
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
          >
            {t("resetPassword.confirmPasswordLabel", "Confirm New Password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t(
                "resetPassword.confirmPasswordPlaceholder",
                "Re-enter your new password",
              )}
              required
              minLength={8}
              className="w-full rounded-xl border border-[#1E2329] bg-[#0E1217] pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("resetPassword.submittingButton", "Updating Password...")}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {t("resetPassword.submitButton", "Reset Password")}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
