import { useState } from "react";
import { MessageSquare, Check, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviewWorkoutSession } from "../hooks/useReviewWorkoutSession";
import type { WorkoutSession } from "../types/workout-session.types";

interface CoachReviewCardProps {
  session: WorkoutSession;
}

export default function CoachReviewCard({ session }: CoachReviewCardProps) {
  const { isCoachOrAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(session.coachFeedback || "");

  const { mutate: reviewSession, isPending } = useReviewWorkoutSession();

  const handleSave = () => {
    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    reviewSession(
      {
        id: session.id,
        payload: { feedback: feedback.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Feedback submitted to member successfully!");
          setIsEditing(false);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to submit coach feedback.",
          );
        },
      },
    );
  };

  const hasFeedback = Boolean(session.coachFeedback);

  if (!hasFeedback && !isCoachOrAdmin) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#5BE584]" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Coach Review & Feedback
          </h2>
        </div>

        {isCoachOrAdmin && hasFeedback && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setFeedback(session.coachFeedback || "");
              setIsEditing(true);
            }}
            className="text-xs font-semibold text-[#5BE584] hover:underline"
          >
            Edit Feedback
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-[#1E2329] bg-[#11151B] p-6 shadow-sm">
        {hasFeedback && !isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">
                    {session.coachReviewedBy?.name || "Your Coach"}
                  </span>
                  <p className="text-[10px] text-[#9CA3AF]">
                    {session.coachReviewedAt
                      ? new Date(session.coachReviewedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "Reviewed"}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16291D] border border-[#23422E] px-2.5 py-1 text-[11px] font-medium text-[#5BE584]">
                <Check className="h-3 w-3" />
                Reviewed
              </span>
            </div>

            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-[#5BE584]/50">
              {session.coachFeedback}
            </p>
          </div>
        ) : isCoachOrAdmin ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Sparkles className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>
                Provide encouraging guidance, form adjustments, or next steps
                for this workout.
              </span>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Great intensity on the bench press today! Next week let's aim for 82.5kg for the top set..."
              rows={4}
              maxLength={1000}
              className="w-full bg-[#0D1014] border border-[#1E2329] rounded-xl p-3.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5BE584] resize-none transition-colors"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#6B7280]">
                {feedback.length}/1000 characters
              </span>

              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !feedback.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-50"
                >
                  {isPending && (
                    <span className="w-3 h-3 border-2 border-[#090B0F] border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {hasFeedback ? "Update Review" : "Submit Coach Review"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
