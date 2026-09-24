// src/features/member-insights/components/shared/InsightsHeader.tsx

import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, LineChart } from "lucide-react";

export const InsightsHeader: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();

  return (
    <div className="flex flex-col gap-4 border-b border-[#1E2329] pb-6">
      <Link
        to={`/members/${memberId}`}
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-[#5BE584]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Member Profile
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#23422e] bg-[#16291d] text-[#5BE584]">
            <LineChart className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-gray-100">
              Member Insights
            </h1>
            <p className="text-xs text-gray-500">
              Training performance, body progress, and consistency overview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
