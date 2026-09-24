// src/features/members-management/components/MembersToolbar.tsx
import React from "react";
import { MembersSearch } from "./MembersSearch";
import { MembersFilters } from "./MembersFilters";

interface MembersToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  statusValue: string;
  onStatusChange: (val: string) => void;
  sortValue: string;
  onSortChange: (val: string) => void;
}

export const MembersToolbar: React.FC<MembersToolbarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  sortValue,
  onSortChange,
}) => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center gap-3 rounded-lg border border-[#1e2329] bg-[#0d1014] p-3">
      <MembersSearch value={searchValue} onChange={onSearchChange} />
      <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto">
        <MembersFilters
          status={statusValue}
          onStatusChange={onStatusChange}
          sort={sortValue}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
};
