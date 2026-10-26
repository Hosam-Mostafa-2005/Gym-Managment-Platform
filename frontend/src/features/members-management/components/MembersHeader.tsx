// src/features/members-management/components/MembersHeader.tsx
import React from "react";
import { Users, UserPlus } from "lucide-react";

interface MembersHeaderProps {
  totalMembers?: number;
  onInviteClick?: () => void;
}

export const MembersHeader: React.FC<MembersHeaderProps> = ({
  totalMembers,
  onInviteClick,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              Coach Operations Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Members
          </h1>
          <p className="text-xs text-gray-400 max-w-xl">
            Manage assigned members, monitor training progress, track coaching activity metrics, and invite new members to train with you.
          </p>
        </div>

        {onInviteClick && (
          <button
            type="button"
            onClick={onInviteClick}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] shadow-md shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {totalMembers !== undefined && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Assigned Members
              </span>
              <Users className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <span className="text-2xl font-bold font-mono text-gray-100">
              {totalMembers}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">
              Active clients & assignments
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
