import { Clock, CheckCircle2, XCircle } from "lucide-react";

export const RecentSessions = ({ sessions }: { sessions: any[] }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-white tracking-tight mb-10">
        Recent Sessions
      </h2>

      <div className="bg-[#11151B] border border-white/5 rounded-2xl p-10">
        {sessions.length > 0 ? (
          <div className="relative pl-8 space-y-12 border-l border-white/10 before:absolute before:inset-y-0 before:left-[31px] before:w-px before:bg-white/10">
            {sessions.map((session) => (
              <div key={session.id} className="relative">
                <span className="absolute -left-[43px] top-1.5 w-5 h-5 rounded-full border-4 border-[#11151B] bg-[#5BE584]" />

                <div className="hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <h4 className="text-xl font-bold text-white tracking-tight">
                      {session.assignment?.workout?.title || "Custom Workout"}
                    </h4>
                    <span className="text-base font-medium text-zinc-500">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-base font-medium">
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-5 h-5" /> {session.duration} min
                    </span>
                    <span
                      className={`flex items-center gap-2 ${session.status === "COMPLETED" ? "text-[#5BE584]" : "text-zinc-500"}`}
                    >
                      {session.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      {session.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 font-medium text-lg">
            No recent sessions found.
          </div>
        )}
      </div>
    </section>
  );
};
