import React from "react";

interface CompletionCardProps {
  completed: number;
  total: number;
}

export const CompletionCard = ({ completed, total }: CompletionCardProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="bg-[#11151B] border border-white/5 rounded-2xl p-6 md:p-8 mb-10 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Training Completion
          </h2>
          <p className="text-zinc-400 text-sm">
            You have completed {completed} out of {total} scheduled sessions.
          </p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <div className="mt-6 h-3 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#5BE584] rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
};
