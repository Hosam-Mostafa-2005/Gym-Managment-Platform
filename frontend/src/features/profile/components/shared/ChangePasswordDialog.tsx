// src/features/profile/components/shared/ChangePasswordDialog.tsx
import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  updatePassword,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePasswordWithCode,
} from "@/features/auth/api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import type { EmailDeliveryInfo } from "@/features/auth/types/auth.types";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  hasPassword?: boolean;
  googleLinked?: boolean;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onClose,
  userEmail,
  hasPassword = true,
  googleLinked = false,
}) => {
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"current" | "email">(
    hasPassword ? "current" : "email",
  );

  // Method A State
  const [currentPassword, setCurrentPassword] = useState("");
  const [methodANewPassword, setMethodANewPassword] = useState("");
  const [methodAConfirmPassword, setMethodAConfirmPassword] = useState("");
  const [isSubmittingA, setIsSubmittingA] = useState(false);

  // Method B State
  const [emailStep, setEmailStep] = useState<"request" | "verify">("request");
  const [otpCode, setOtpCode] = useState("");
  const [methodBNewPassword, setMethodBNewPassword] = useState("");
  const [methodBConfirmPassword, setMethodBConfirmPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmittingB, setIsSubmittingB] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [delivery, setDelivery] = useState<EmailDeliveryInfo | undefined>();

  const [showPasswords, setShowPasswords] = useState(false);

  if (!isOpen) return null;

  // Method A Handler
  const handleSubmitMethodA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (methodANewPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (methodANewPassword !== methodAConfirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSubmittingA(true);
    try {
      const res = await updatePassword({
        currentPassword,
        newPassword: methodANewPassword,
      });

      tokenService.saveToken(res.token);
      if (currentUser) {
        setUser({ ...currentUser, ...res.data.user, hasPassword: true });
      }

      toast.success(res.message || "Password updated successfully!");
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to update password.";
      toast.error(msg);
    } finally {
      setIsSubmittingA(false);
    }
  };

  // Method B - Step 1: Request Code
  const handleRequestCode = async () => {
    setIsSendingOtp(true);
    try {
      const res = await requestPasswordChangeOtp();
      toast.success(res.message);
      if (res.delivery) {
        setDelivery(res.delivery);
      }
      setEmailStep("verify");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send code.";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Method B - Step 2: Verify & Confirm
  const handleSubmitMethodB = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast.error("Verification code must be 6 digits.");
      return;
    }

    if (methodBNewPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (methodBNewPassword !== methodBConfirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSubmittingB(true);
    try {
      let activeResetToken = resetToken;

      // If token not yet obtained, verify code first
      if (!activeResetToken) {
        const verifyRes = await verifyPasswordChangeOtp({ code: otpCode.trim() });
        activeResetToken = verifyRes.data.resetToken;
        setResetToken(activeResetToken);
      }

      const res = await changePasswordWithCode({
        resetToken: activeResetToken,
        newPassword: methodBNewPassword,
      });

      tokenService.saveToken(res.token);
      if (currentUser) {
        setUser({ ...currentUser, ...res.data.user, hasPassword: true });
      }

      toast.success(res.message || "Password updated successfully!");
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to update password with code.";
      toast.error(msg);
    } finally {
      setIsSubmittingB(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#2A313A] bg-[#101418] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1E2329] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#1E2329] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 text-[#5BE584]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {hasPassword ? "Change Password" : "Set Local Password"}
            </h3>
            <p className="text-xs text-gray-400">
              Manage your credentials and security access.
            </p>
          </div>
        </div>

        {/* Google Status Notice */}
        {googleLinked && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Google Account Linked ({userEmail})</span>
          </div>
        )}

        {/* Tabs Selection (only if user has a password) */}
        {hasPassword && (
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-[#1E2329] bg-[#090B0F] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("current")}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "current"
                  ? "bg-[#1E2329] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Current Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "email"
                  ? "bg-[#1E2329] text-[#5BE584] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Email Verification
            </button>
          </div>
        )}

        {/* METHOD A: CURRENT PASSWORD */}
        {activeTab === "current" && hasPassword && (
          <form onSubmit={handleSubmitMethodA} className="mt-5 space-y-3.5">
            <div>
              <label
                htmlFor="dialog-current-password"
                className="block text-xs font-semibold text-gray-300 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="dialog-current-password"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dialog-new-password-a"
                className="block text-xs font-semibold text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                id="dialog-new-password-a"
                type={showPasswords ? "text" : "password"}
                value={methodANewPassword}
                onChange={(e) => setMethodANewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
            </div>

            <div>
              <label
                htmlFor="dialog-confirm-password-a"
                className="block text-xs font-semibold text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="dialog-confirm-password-a"
                type={showPasswords ? "text" : "password"}
                value={methodAConfirmPassword}
                onChange={(e) => setMethodAConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
              >
                {showPasswords ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span>{showPasswords ? "Hide Passwords" : "Show Passwords"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className="text-xs text-[#5BE584] hover:underline"
              >
                Forgot current password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmittingA || !currentPassword || !methodANewPassword}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#49D472] disabled:opacity-50"
            >
              {isSubmittingA ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Update Password
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD B: EMAIL OTP */}
        {(activeTab === "email" || !hasPassword) && (
          <div className="mt-5">
            {emailStep === "request" ? (
              <div className="flex flex-col gap-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Send Verification Code
                  </h4>
                  <p className="mt-1 text-xs text-gray-400 max-w-xs mx-auto">
                    We will send a 6-digit confirmation code to{" "}
                    <strong className="text-white">{userEmail}</strong> to verify
                    your identity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={isSendingOtp}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#49D472] disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send 6-Digit Code
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitMethodB} className="space-y-3.5">
                {/* Delivery Status Banner */}
                {delivery && delivery.provider !== "console" && !delivery.accepted && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-300">Delivery Issue</p>
                      <p className="text-red-200/90 text-[11px] leading-relaxed">
                        {delivery.errorMessage ||
                          "Could not deliver email. Please check your settings or try resending."}
                      </p>
                    </div>
                  </div>
                )}

                {delivery && delivery.provider !== "console" && delivery.accepted && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-green-500/25 bg-green-500/10 p-3 text-xs text-green-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-300">Code Dispatched</p>
                      <p className="text-green-200/90 text-[11px] leading-relaxed">
                        Accepted by {delivery.provider.toUpperCase()}
                        {delivery.messageId ? ` (${delivery.messageId.slice(0, 8)}...)` : ""}. Check your inbox.
                      </p>
                    </div>
                  </div>
                )}

                {delivery?.provider === "console" && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">
                    <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300">Dev Notice</p>
                      <p className="text-amber-200/90 text-[11px] leading-relaxed">
                        Real email delivery is disabled (console mock active).
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="dialog-otp-code"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    6-Digit Verification Code
                  </label>
                  <input
                    id="dialog-otp-code"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.4em] font-bold text-base rounded-xl border border-[#1E2329] bg-[#090B0F] py-2 text-[#5BE584] placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={isSendingOtp}
                      className="text-[11px] text-[#5BE584] hover:underline"
                    >
                      Resend code
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dialog-new-password-b"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="dialog-new-password-b"
                    type={showPasswords ? "text" : "password"}
                    value={methodBNewPassword}
                    onChange={(e) => setMethodBNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dialog-confirm-password-b"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="dialog-confirm-password-b"
                    type={showPasswords ? "text" : "password"}
                    value={methodBConfirmPassword}
                    onChange={(e) => setMethodBConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    <span>{showPasswords ? "Hide" : "Show"} Passwords</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmittingB ||
                    otpCode.length !== 6 ||
                    !methodBNewPassword ||
                    methodBNewPassword !== methodBConfirmPassword
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE584] py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#49D472] disabled:opacity-50"
                >
                  {isSubmittingB ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Verifying & Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm & Save Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
