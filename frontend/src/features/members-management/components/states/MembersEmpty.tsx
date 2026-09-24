// src/features/members-management/components/states/MembersEmpty.tsx
import React from "react";
import { Users } from "lucide-react";

interface MembersEmptyProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const MembersEmpty: React.FC<MembersEmptyProps> = ({
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-lg border border-[#1e2329] bg-[#0d1014] mt-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] mb-4 text-[#5BE584]">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-100">
        {hasFilters
          ? "No members match your filters"
          : "No assigned members found"}
      </h3>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        {hasFilters
          ? "Try adjusting your search query, status, or sorting criteria to find what you're looking for."
          : "You currently have no members assigned to your roster."}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 rounded-md bg-[#13171d] border border-[#1e2329] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};
