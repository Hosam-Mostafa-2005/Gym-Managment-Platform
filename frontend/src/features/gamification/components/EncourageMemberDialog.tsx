// src/features/gamification/components/EncourageMemberDialog.tsx

import React, { useState } from "react";
import { X, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { useSendEncouragement } from "../hooks/useGamification";

interface EncourageMemberDialogProps {
  memberId: string;
  memberName: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  "Incredible consistency this week! Keep crushing it! 🔥",
  "Great job maintaining your workout streak! Proud of your hard work.",
  "You're making noticeable progress. Let's keep this momentum rolling!",
  "Saw your latest session finish strong. Outstanding effort! 💪",
];

export const EncourageMemberDialog: React.FC<EncourageMemberDialogProps> = ({
  memberId,
  memberName,
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState(PRESET_MESSAGES[0]);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: send, isPending, error } = useSendEncouragement();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    send(
      { memberId, payload: { message: message.trim() } },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 1500);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#2A313A] bg-[#101418] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isPending}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1E2329] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#1E2329] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/15 text-yellow-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Encourage {memberName}
            </h3>
            <p className="text-xs text-gray-400">
              Send a motivational notification directly to your athlete.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-[#5BE584] animate-bounce" />
            <h4 className="mt-3 text-base font-bold text-white">
              Encouragement Sent!
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              {memberName} has received your motivational message.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Quick Cheer Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_MESSAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(preset)}
                    className={`rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
                      message === preset
                        ? "border-[#5BE584]/50 bg-[#5BE584]/15 text-[#5BE584]"
                        : "border-[#1E2329] bg-[#090B0F] text-gray-400 hover:border-gray-700 hover:text-gray-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="encouragement-message"
                className="block text-xs font-semibold text-gray-300 mb-1.5"
              >
                Custom Message
              </label>
              <textarea
                id="encouragement-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                rows={3}
                required
                placeholder="Write a personalized encouragement..."
                className="w-full rounded-xl border border-[#1E2329] bg-[#090B0F] p-3 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
              <div className="flex justify-end text-[10px] text-gray-500 mt-1">
                {message.length} / 300 characters
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">
                {error instanceof Error ? error.message : "Failed to send encouragement."}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl border border-[#1E2329] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-[#1E2329]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !message.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#49D472] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isPending ? "Sending..." : "Send Encouragement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
