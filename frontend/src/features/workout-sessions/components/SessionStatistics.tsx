import { Clock, Activity, Dumbbell, Layers, Gauge } from "lucide-react";

interface SessionStatisticsProps {
  duration: number;
  totalVolume: number;
  exercisesCompleted: number;
  setsCompleted: number;
  sessionRpe?: number | null;
}

export default function SessionStatistics({
  duration,
  totalVolume,
  exercisesCompleted,
  setsCompleted,
  sessionRpe,
}: SessionStatisticsProps) {
  const stats = [
    {
      label: "Duration",
      value: `${duration}m`,
      icon: Clock,
    },
    {
      label: "Volume",
      value: `${totalVolume} kg`,
      icon: Activity,
    },
    {
      label: "Exercises",
      value: exercisesCompleted,
      icon: Dumbbell,
    },
    {
      label: "Sets",
      value: setsCompleted,
      icon: Layers,
    },
    ...(sessionRpe
      ? [
          {
            label: "Exertion (RPE)",
            value: `${sessionRpe} / 10`,
            icon: Gauge,
          },
        ]
      : []),
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-white tracking-tight px-1">
        Session Statistics
      </h2>

      <div
        className={`grid grid-cols-2 gap-4 ${
          stats.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4"
        }`}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#11151B] border border-white/5 rounded-2xl p-6 shadow-sm transition-colors hover:border-white/10"
            >
              <div className="flex items-center gap-2 text-[#9CA3AF] mb-3">
                <Icon size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
