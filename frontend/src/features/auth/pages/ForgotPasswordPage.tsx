// src/features/auth/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../api/auth.api";

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(
        t("forgotPassword.emailRequiredToast", "Please enter your email address."),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword({ email: email.trim() });
      toast.success(res.message);
      navigate(`/verify-reset-code?email=${encodeURIComponent(email.trim())}`, {
        state: { delivery: res.delivery },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        t("forgotPassword.failedToast", "Failed to process request.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs text-[#91A0B5] hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        {t("forgotPassword.backToSignIn", "Back to Sign In")}
      </Link>

      <div className="mb-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
          {t("forgotPassword.title", "Reset Your Password")}
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          {t(
            "forgotPassword.subtitle",
            "Enter the email address associated with your STREN account to receive password reset instructions.",
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="recovery-email"
            className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
          >
            {t("forgotPassword.emailLabel", "Email Address")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              id="recovery-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("forgotPassword.emailPlaceholder", "athlete@example.com")}
              required
              className="w-full rounded-xl border border-[#1E2329] bg-[#0E1217] pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("forgotPassword.submittingButton", "Processing...")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 rtl:-scale-x-100" />
              {t("forgotPassword.submitButton", "Send Recovery Code")}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#1E2329] pt-4 text-center text-xs text-[#91A0B5]">
        {t("forgotPassword.rememberedPrompt", "Remembered your password?")}{" "}
        <Link to="/login" className="font-semibold text-[#5BE584] hover:text-[#49D472]">
          {t("forgotPassword.signInLink", "Sign in")}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
