// src/features/auth/pages/VerifyEmailPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { verifyEmail, resendVerification } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import type { EmailDeliveryInfo } from "../types/auth.types";
import { resolveAuthRedirect } from "../utils/auth-redirect";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const initialEmail = searchParams.get("email") || "";
  const initialDelivery = (location.state as any)?.delivery as
    | EmailDeliveryInfo
    | undefined;

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [delivery, setDelivery] = useState<EmailDeliveryInfo | undefined>(
    initialDelivery,
  );

  // Resend cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) {
      toast.error("Please enter both your email address and 6-digit code.");
      return;
    }

    if (code.trim().length !== 6) {
      toast.error("Verification code must be 6 digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });

      tokenService.saveToken(response.token);
      setUser(response.data.user);
      queryClient.setQueryData(["current-user"], response.data.user);

      toast.success(response.message || "Email verified successfully!");

      const searchParamsObj = new URLSearchParams(location.search);
      const returnUrl = searchParamsObj.get("returnTo");

      const destination = resolveAuthRedirect({
        user: response.data.user,
        returnUrl,
        locationState: location.state,
      });

      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Verification failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please provide your email address.");
      return;
    }

    setIsResending(true);
    try {
      const res = await resendVerification({ email: email.trim() });
      toast.success(res.message);
      if (res.delivery) {
        setDelivery(res.delivery);
      }
      setCooldown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend code.";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back Link */}
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs text-[#91A0B5] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>

      {/* Header */}
      <div className="mb-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-[#5BE584] mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          We&apos;ve sent a 6-digit confirmation code to{" "}
          <strong className="text-white">{email || "your email"}</strong>.
          Enter the code below to complete registration and access your workspace.
        </p>
      </div>

      {/* Delivery Diagnostic Notification Banner */}
      {delivery?.provider === "console" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-200">
          <Info className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Development Notice: Real email delivery is disabled
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              <code>EMAIL_PROVIDER=console</code> is active in{" "}
              <code>backend/.env</code>. No external email was sent to your
              inbox. The OTP was securely hashed in PostgreSQL. To deliver
              real emails, configure Resend (<code>RESEND_API_KEY</code>) or SMTP in{" "}
              <code>backend/.env</code>.
            </p>
          </div>
        </div>
      )}

      {delivery && delivery.provider !== "console" && !delivery.accepted && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-300">Email Delivery Issue</p>
            <p className="text-red-200/90 leading-relaxed">
              {delivery.errorMessage ||
                "The email provider encountered an error while attempting delivery. Please check backend settings or click Resend."}
            </p>
          </div>
        </div>
      )}

      {delivery && delivery.provider !== "console" && delivery.accepted && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500/25 bg-green-500/10 p-4 text-xs text-green-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-green-300">
              Email Dispatched Successfully
            </p>
            <p className="text-green-200/90 leading-relaxed">
              Accepted by {delivery.provider.toUpperCase()}
              {delivery.messageId ? ` (ID: ${delivery.messageId})` : ""}. Please
              check your inbox and spam folder.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        {!initialEmail && (
          <div>
            <label
              htmlFor="verify-email-input"
              className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@example.com"
              required
              className="w-full rounded-xl border border-[#1E2329] bg-[#0E1217] px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="verification-code-input"
            className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
          >
            6-Digit Verification Code
          </label>
          <input
            id="verification-code-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="• • • • • •"
            autoFocus
            required
            className="w-full text-center tracking-[0.5em] text-2xl font-bold rounded-xl border border-[#1E2329] bg-[#0E1217] py-3 text-[#5BE584] placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
          />
          <p className="mt-1.5 text-[11px] text-[#91A0B5]">
            Code expires in 10 minutes. Check your spam folder if not received.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isVerifying || code.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying Code...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Verify & Continue
            </>
          )}
        </button>
      </form>

      {/* Resend Action */}
      <div className="mt-6 flex items-center justify-between border-t border-[#1E2329] pt-4 text-xs">
        <span className="text-[#91A0B5]">Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
