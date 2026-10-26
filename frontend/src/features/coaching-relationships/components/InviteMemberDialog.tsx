import React, { useState } from "react";
import { Mail, FileText, X, Loader2, Send, ShieldCheck, UserCheck } from "lucide-react";
import { useInviteMember } from "../hooks/useInviteMember";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate: sendInvite, isPending } = useInviteMember();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter a valid member email address.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    sendInvite(
      {
        email: email.trim().toLowerCase(),
        notes: notes.trim() ? notes.trim() : undefined,
      },
      {
        onSuccess: (data) => {
          setSuccessMessage(
            `Coaching invitation sent successfully to ${data.member?.name || email}! They will receive an in-app invitation notification.`,
          );
          setTimeout(() => {
            setEmail("");
            setNotes("");
            setSuccessMessage(null);
            onClose();
          }, 1800);
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              "Failed to send coaching invitation.",
          );
        },
      },
    );
  };

  const handleClose = () => {
    setEmail("");
    setNotes("");
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#1E2329] bg-[#0D1014] p-6 shadow-2xl relative text-[#F3F4F6]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2329]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#23422e] bg-[#16291d] text-[#5BE584]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Invite Member</h2>
              <p className="text-xs text-[#9CA3AF]">
                Send an official coaching invitation to an existing member.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#1E2329] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Guidance */}
        <div className="mt-4 rounded-xl border border-[#1E2329] bg-[#101418] p-3.5 text-xs text-gray-400 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#5BE584] font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>How Coaching Invitations Work</span>
          </div>
          <p className="leading-relaxed">
            The member will receive an in-app invitation notification. Once accepted, an active coaching relationship begins. The member will also decide whether to share their pre-coaching history or keep past logs private.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-[#5BE584]">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Member Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending || Boolean(successMessage)}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none transition-colors disabled:opacity-50"
                placeholder="member@example.com"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Must match the email address of a registered STREN member.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Invitation Note / Welcome Message (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending || Boolean(successMessage)}
                rows={3}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#5BE584] focus:outline-none transition-colors disabled:opacity-50 resize-none"
                placeholder="Hi! I'm looking forward to coaching your strength training program..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2329]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#1E2329] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || Boolean(successMessage)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
