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
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { verifyEmail, resendVerification } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { resolveAuthRedirect } from "../utils/auth-redirect";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend cooldown timer countdown (email59 rate limits to one code every 30 seconds)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = email.trim().toLowerCase();
    const targetCode = code.trim().replace(/\D/g, "");

    if (!targetEmail || !targetCode) {
      setErrorMessage("Please enter both your email address and 6-digit verification code.");
      return;
    }

    if (targetCode.length !== 6) {
      setErrorMessage("Verification code must be exactly 6 digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyEmail({
        email: targetEmail,
        code: targetCode,
      });

      if (response.token) {
        tokenService.saveToken(response.token);
      }
      if (response.data?.user) {
        setUser(response.data.user);
        queryClient.setQueryData(["current-user"], response.data.user);
      }

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
      const msg =
        err.response?.data?.message ||
        "Verification failed. Please check your code and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage("Please enter your email address to receive a verification code.");
      return;
    }

    setErrorMessage(null);
    setIsResending(true);
    try {
      const res = await resendVerification({ email: targetEmail });
      toast.success(res.message || "A new verification code has been sent.");
      setCooldown(30);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to resend verification code. Please try again later.";
      setErrorMessage(msg);
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
          We&apos;ve sent a 6-digit verification code to your email. Enter the code below to
          complete registration and unlock your STREN account.
        </p>
      </div>

      {/* Email pill / editable input */}
      <div className="mb-6 rounded-2xl border border-[#1E2329] bg-[#0E1217] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-[#91A0B5]">
              Target Email Address
            </span>
            {isEditingEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                className="mt-1 w-full rounded-lg border border-[#2A313A] bg-[#161B22] px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
            ) : (
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {email || "(No email specified)"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingEmail(!isEditingEmail)}
            className="flex items-center gap-1 rounded-lg border border-[#252B33] bg-[#171B20] px-2.5 py-1.5 text-xs text-[#91A0B5] hover:text-white hover:border-[#374151] transition-colors"
          >
            {isEditingEmail ? (
              <>
                <Check className="h-3 w-3 text-[#5BE584]" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Edit2 className="h-3 w-3" />
                <span>Change</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Provider / Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-300">Verification Issue</p>
            <p className="text-red-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Code Input Form */}
      <form onSubmit={handleVerify} className="space-y-4">
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
            Code expires in 10 minutes. Check your spam or promotions folder if not received.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isVerifying || code.trim().length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-3 text-xs font-bold text-[#0B0D10] transition-all hover:bg-[#49D472] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#0B0D10]" />
              Verifying Code...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#0B0D10]" />
              Verify & Activate Account
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
          className="inline-flex items-center gap-1.5 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
