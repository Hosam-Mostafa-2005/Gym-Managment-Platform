// src/features/member-insights/components/states/InsightsEmpty.tsx

import React from "react";
import { LineChart } from "lucide-react";

export const InsightsEmpty: React.FC = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1014] p-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1E2329]">
          <LineChart className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-100">
          No insights available
        </h2>
        <p className="text-sm text-gray-400">
          There is not enough workout or measurement data to display insights
          yet.
        </p>
      </div>
    </div>
  );
};
