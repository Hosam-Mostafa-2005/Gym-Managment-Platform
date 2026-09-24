import React from "react";

interface MembersFiltersProps {
  status: string;
  sort: string;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const MembersFilters: React.FC<MembersFiltersProps> = ({
  status,
  sort,
  onStatusChange,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-9 rounded-md border border-[#1e2329] bg-[#090B0F] px-3 text-xs text-gray-300 focus:border-[#5BE584] focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="h-9 rounded-md border border-[#1e2329] bg-[#090B0F] px-3 text-xs text-gray-300 focus:border-[#5BE584] focus:outline-none"
      >
        <option value="">Sort: Newest</option>
        <option value="newest">Newest Members</option>
        <option value="oldest">Oldest Members</option>
        <option value="name">Name (A-Z)</option>
        <option value="latestWorkout">Latest Workout</option>
        <option value="latestWeight">Latest Weight</option>
        <option value="completionRate">Completion Rate</option>
      </select>
    </div>
  );
};
