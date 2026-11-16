import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Archive, Loader2 } from "lucide-react";
import { useArchiveAssignment } from "../hooks/useArchiveAssignment";

interface ArchiveAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  workoutTitle?: string;
}

export const ArchiveAssignmentDialog: React.FC<ArchiveAssignmentDialogProps> = ({
  isOpen,
  onClose,
  assignmentId,
  workoutTitle,
}) => {
  const { mutate: archiveAssignment, isPending } = useArchiveAssignment();

  const handleConfirm = () => {
    archiveAssignment(assignmentId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#1E2329] bg-[#101418] text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Archive Assignment
              </DialogTitle>
              <DialogDescription className="text-xs text-[#9CA3AF]">
                Hide this assignment from your primary list
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-[#9CA3AF] leading-relaxed">
          Are you sure you want to archive{" "}
          <span className="font-semibold text-white">
            {workoutTitle || "this workout assignment"}
          </span>
          ? It will be moved to your archived view without altering its completion
          status or history.
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-[#090B0F] hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveAssignmentDialog;
