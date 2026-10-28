import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Calendar,
  Eye,
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createWorkoutShare,
  getWorkoutShares,
  revokeWorkoutShare,
  type CreatedShareResult,
} from "../api/workoutShare.api";
import { toast } from "sonner";

interface ShareWorkoutDialogProps {
  workoutId: string;
  workoutTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareWorkoutDialog: React.FC<ShareWorkoutDialogProps> = ({
  workoutId,
  workoutTitle,
  isOpen,
  onClose,
}) => {
  const [activeShare, setActiveShare] = useState<CreatedShareResult | null>(null);
  const [sharesList, setSharesList] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expirationOption, setExpirationOption] = useState<string>("never");

  const loadExistingShares = async () => {
    try {
      setIsLoadingList(true);
      const data = await getWorkoutShares(workoutId);
      setSharesList(data);
      if (data.length > 0 && !activeShare) {
        setActiveShare({
          id: data[0].id,
          workoutId,
          workoutTitle,
          shareCode: data[0].shareCode,
          shareToken: "",
          expiresAt: data[0].expiresAt,
          createdAt: data[0].createdAt,
        });
      }
    } catch {
      // Non-blocking error
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExistingShares();
    } else {
      setCopiedCode(false);
      setCopiedLink(false);
    }
  }, [isOpen, workoutId]);

  const handleCreateShare = async () => {
    try {
      setIsGenerating(true);
      let expiresAt: string | null = null;
      if (expirationOption === "24h") {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expirationOption === "7d") {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expirationOption === "30d") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const result = await createWorkoutShare(workoutId, expiresAt);
      setActiveShare(result);
      await loadExistingShares();
      toast.success("Share link and code created successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create share link");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCode = activeShare?.shareCode || "";
  const shareUrl = shareCode
    ? `${window.location.origin}/share/workout/${shareCode}`
    : "";

  const handleCopyCode = async () => {
    if (!shareCode) return;
    await navigator.clipboard.writeText(shareCode);
    setCopiedCode(true);
    toast.success("Share code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Direct share link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await revokeWorkoutShare(shareId);
      toast.success("Share link revoked.");
      if (activeShare?.id === shareId) {
        setActiveShare(null);
      }
      await loadExistingShares();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke share link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#1E2329] bg-[#0D1014] text-[#F3F4F6] sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#5BE584]">
            <Share2 className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold text-white">
              Share Workout Routine
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#9CA3AF]">
            Share &ldquo;{workoutTitle}&rdquo; securely with another athlete.
            Recipients can preview and import it into their private routines.
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-[#141920]/60 p-3 text-xs text-[#9CA3AF]">
          <ShieldCheck className="h-4 w-4 text-[#5BE584] shrink-0 mt-0.5" />
          <span>
            Private workout logs, sessions, personal performance, and notes are
            never shared. Only the routine definition and prescribed exercises are included.
          </span>
        </div>

        {/* Active Share Box */}
        {shareCode ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Share Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareCode}
                  className="flex-1 rounded-lg border border-[#2A3039] bg-[#090B0F] px-3 py-2 font-mono text-sm font-bold tracking-wider text-[#5BE584] focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="border-[#2A3039] bg-[#141920] hover:bg-[#1E2329] text-white"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-[#5BE584]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Direct URL Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 truncate rounded-lg border border-[#2A3039] bg-[#090B0F] px-3 py-2 text-xs text-[#9CA3AF] focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyLink}
                  className="bg-[#5BE584] text-[#090B0F] hover:bg-[#49D472] font-semibold"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Generate / New Share Controls */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">
              Link Expiration:
            </span>
            <select
              value={expirationOption}
              onChange={(e) => setExpirationOption(e.target.value)}
              className="rounded-md border border-[#2A3039] bg-[#141920] px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="never">No Expiration</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>

          <Button
            type="button"
            onClick={handleCreateShare}
            disabled={isGenerating}
            className="w-full bg-[#18231C] border border-[#5BE584]/30 text-[#5BE584] hover:bg-[#5BE584]/15 font-semibold text-xs py-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Share2 className="h-4 w-4 mr-1.5" />
            )}
            {shareCode ? "Generate Another Share Link" : "Create Share Link & Code"}
          </Button>
        </div>

        {/* Existing Shares List */}
        {sharesList.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Active Shares
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {sharesList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-[#101418] px-3 py-2 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white">
                      {item.shareCode}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> {item.viewCount} views
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Download className="h-3 w-3" /> {item.importCount} imports
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeShare(item.id)}
                    className="h-7 px-2 text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                    title="Revoke Share"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareWorkoutDialog;
