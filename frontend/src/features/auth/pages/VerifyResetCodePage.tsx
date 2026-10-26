// src/features/auth/pages/VerifyResetCodePage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  KeyRound,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { verifyResetCode, forgotPassword } from "../api/auth.api";
import type { EmailDeliveryInfo } from "../types/auth.types";

export const VerifyResetCodePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

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
      const response = await verifyResetCode({
        email: email.trim(),
        code: code.trim(),
      });

      toast.success(response.message || "Code confirmed!");
      navigate(
        `/reset-password?resetToken=${encodeURIComponent(
          response.data.resetToken,
        )}&email=${encodeURIComponent(response.data.email)}`,
        { replace: true },
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired code.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResending(true);
    try {
      const res = await forgotPassword({ email: email.trim() });
      toast.success(res.message);
      if (res.delivery) {
        setDelivery(res.delivery);
      }
      setCooldown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend recovery code.";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-1.5 text-xs text-[#91A0B5] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Password Reset
      </Link>

      <div className="mb-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
          Enter Recovery Code
        </h2>
        <p className="mt-2 text-sm text-[#91A0B5] leading-relaxed">
          Please enter the 6-digit password reset code sent to{" "}
          <strong className="text-white">{email || "your email"}</strong>.
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
              inbox. Configure Resend or SMTP to deliver real emails.
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

      <form onSubmit={handleVerify} className="space-y-4">
        {!initialEmail && (
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="reset-email"
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
            htmlFor="reset-code-input"
            className="block text-xs font-semibold text-[#CBD5E1] mb-1.5"
          >
            6-Digit Reset Code
          </label>
          <input
            id="reset-code-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="• • • • • •"
            autoFocus
            required
            className="w-full text-center tracking-[0.5em] text-2xl font-bold rounded-xl border border-[#1E2329] bg-[#0E1217] py-3 text-yellow-400 placeholder-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <p className="mt-1.5 text-[11px] text-[#91A0B5]">
            Code expires in 10 minutes.
          </p>
        </div>

        <button
          type="submit"
          disabled={isVerifying || code.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating Code...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Set New Password
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-[#1E2329] pt-4 text-xs">
        <span className="text-[#91A0B5]">Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
};

export default VerifyResetCodePage;
