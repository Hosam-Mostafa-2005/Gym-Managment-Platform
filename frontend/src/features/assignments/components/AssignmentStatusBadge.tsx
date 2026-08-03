import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/features/assignments/types/assignment.types";

interface Props {
  status: AssignmentStatus | string;
}

export const AssignmentStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-medium text-xs gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="secondary"
          className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800/80 border border-zinc-700 font-medium text-xs gap-1"
        >
          ✓ Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="secondary"
          className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-medium text-xs gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs font-medium">
          {status}
        </Badge>
      );
  }
};
