import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

const ExerciseFilters = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input placeholder="Search exercises..." className="pl-10" />
      </div>
    </div>
  );
};

export default ExerciseFilters;
