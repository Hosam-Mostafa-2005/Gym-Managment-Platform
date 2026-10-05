const TOP_FEATURES = [
  {
    id: "01",
    title: "WORKOUTS",
    description: "Build and manage structured training programs.",
  },
  {
    id: "02",
    title: "ASSIGNMENTS",
    description: "Connect coaches and members through assigned training plans.",
  },
  {
    id: "03",
    title: "WORKOUT SESSIONS",
    description:
      "Track real workout sessions, sets, reps, volume, and duration.",
  },
];

const BOTTOM_FEATURES = [
  {
    id: "04",
    title: "PROGRESS",
    description: "Track training progress and performance over time.",
  },
  {
    id: "05",
    title: "BODY MEASUREMENTS",
    description: "Keep track of physical measurements and changes.",
  },
  {
    id: "06",
    title: "INSIGHTS",
    description:
      "Understand training behavior and performance through analytics.",
  },
  {
    id: "07",
    title: "NOTIFICATIONS",
    description: "Stay informed about important training activity.",
  },
];

export default function OverviewFeatures() {
  return (
    <section className="sticky top-0 z-20 flex min-h-screen w-full flex-col justify-center bg-[#101418] border-t border-[#1E2329] text-[#F3F4F6] shadow-2xl">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-12">
        <h2 className="text-[11px] font-bold tracking-widest text-[#5BE584] uppercase mb-12">
          What STREN Gives You
        </h2>

        {/* Primary Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1E2329] border border-[#1E2329] mb-px">
          {TOP_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#101418] p-8 md:p-12 hover:bg-[#12171C] transition-colors"
            >
              <span className="block text-[10px] font-mono text-[#6B7280] mb-4">
                {feature.id}
              </span>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1E2329] border border-[#1E2329] border-t-0">
          {BOTTOM_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#101418] p-6 md:p-8 hover:bg-[#12171C] transition-colors"
            >
              <span className="block text-[10px] font-mono text-[#6B7280] mb-3">
                {feature.id}
              </span>
              <h3 className="text-sm font-bold tracking-wider text-white mb-2 uppercase">
                {feature.title}
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
