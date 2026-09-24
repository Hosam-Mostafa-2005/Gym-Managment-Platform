// src/features/members-management/components/MembersPagination.tsx
import React from "react";

interface MembersPaginationProps {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export const MembersPagination: React.FC<MembersPaginationProps> = ({
  page,
  limit,
  totalPages,
  totalResults,
  onPageChange,
}) => {
  if (totalResults === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalResults);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-[#1e2329] bg-[#0d1014] p-4">
      <span className="text-[11px] text-gray-400">
        Showing <strong className="text-gray-200">{start}</strong> to{" "}
        <strong className="text-gray-200">{end}</strong> of{" "}
        <strong className="text-gray-200">{totalResults}</strong> athletes
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-8 items-center justify-center rounded border border-[#1e2329] bg-[#13171d] px-3 text-[11px] font-medium text-gray-300 transition-colors hover:bg-white/[0.04] disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>

        {/* Simple page indicator for dense dashboard context */}
        <div className="flex h-8 items-center justify-center rounded bg-[#16291d] border border-[#23422e] px-3 text-[11px] font-bold text-[#5BE584] mx-1">
          {page}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 items-center justify-center rounded border border-[#1e2329] bg-[#13171d] px-3 text-[11px] font-medium text-gray-300 transition-colors hover:bg-white/[0.04] disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};
