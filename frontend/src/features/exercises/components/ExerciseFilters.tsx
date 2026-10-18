import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface ExerciseFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
}

const ExerciseFilters = ({
  search = "",
  onSearchChange,
}: ExerciseFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search exercises by name, muscle, or equipment..."
          className="pl-10 pr-9"
        />

        {search && (
          <button
            type="button"
            onClick={() => onSearchChange?.("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExerciseFilters;
