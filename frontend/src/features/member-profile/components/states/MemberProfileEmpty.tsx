// src/features/member-profile/components/states/MemberProfileEmpty.tsx

import React from "react";
import { UserRound } from "lucide-react";

export const MemberProfileEmpty: React.FC = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1E2329]">
          <UserRound className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-100">
          Member profile not found
        </h2>
        <p className="text-sm text-gray-400">
          The requested member profile could not be found or you do not have
          permission to view it.
        </p>
      </div>
    </div>
  );
};
