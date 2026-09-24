import React from "react";
import { Search } from "lucide-react";

interface MembersSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const MembersSearch: React.FC<MembersSearchProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        <Search className="h-4 w-4" />
      </div>

      <input
        type="text"
        placeholder="Search member name or email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-[#1e2329] bg-[#090B0F] pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
      />
    </div>
  );
};
