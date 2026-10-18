import {
  Activity,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Flame,
  Scale,
  Users,
} from "lucide-react";

const CAPABILITIES = [
  {
    id: "01",
    title: "Workout Programming",
    description:
      "Build structured training templates with target sets, reps, rest intervals, and movement order.",
    icon: Dumbbell,
  },
  {
    id: "02",
    title: "Exercise Library",
    description:
      "Browse and manage categorized exercises with target muscles, equipment tags, and form cues.",
    icon: BookOpen,
  },
  {
    id: "03",
    title: "Training Assignments",
    description:
      "Assign workouts directly to members with scheduled dates, coaching notes, and completion status.",
    icon: ClipboardList,
  },
  {
    id: "04",
    title: "Live Workout Sessions",
    description:
      "Log sets, reps, and weights in real time during active training sessions with automatic volume tracking.",
    icon: Flame,
  },
  {
    id: "05",
    title: "Progress & Body Measurements",
    description:
      "Record body weight, body fat percentage, muscle mass, and circumferences to monitor physical change.",
    icon: Scale,
  },
  {
    id: "06",
    title: "Activity & Notifications",
    description:
      "Stay updated when new training plans are assigned, workouts are completed, or milestones are logged.",
    icon: Bell,
  },
];

const ROLE_WORKFLOWS = [
  {
    role: "Coach Experience",
    badge: "For Trainers & Coaches",
    title: "Design Programs & Guide Member Progression",
    description:
      "Everything a coach needs to standardize programming, assign daily training, and inspect member adherence from one workspace.",
    icon: Users,
    steps: [
      "Create reusable exercises and structured multi-exercise workouts",
      "Assign tailored workouts to individual members with target dates",
      "Review member profiles, completed session logs, and body measurements",
      "Monitor training consistency and performance insights across your roster",
    ],
  },
  {
    role: "Member Experience",
    badge: "For Athletes & Gym Members",
    title: "Follow Assigned Plans & Log Every Session",
    description:
      "A distraction-free training companion built for the gym floor—know exactly what to lift, log sets live, and see measurable progress.",
    icon: Activity,
    steps: [
      "View assigned workouts and upcoming training schedules on your dashboard",
      "Launch live workout sessions and log actual weight and reps set by set",
      "Track personal workout history, session duration, and total volume lifted",
      "Log body measurements and review your physical progress over time",
    ],
  },
];

export default function OverviewFeatures() {
  return (
    <>
      {/* Core Platform Capabilities */}
      <section
        id="capabilities"
        className="relative overflow-hidden w-full border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1017_50%,#090B0F_100%)] text-[#F8FAFC] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16"
      >
        {/* Subtle ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 -left-32 h-[380px] w-[520px] rounded-full bg-[#5BE584]/[0.045] blur-[130px]"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1280px]">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#5BE584] uppercase">
              Core Platform Capabilities
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
              Built for Structured Training & Real Progress
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Every module in STREN is purpose-built to replace disconnected spreadsheets and
              chat notes with a unified system of record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CAPABILITIES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5BE584]/40 hover:shadow-[0_18px_45px_-12px_rgba(0,0,0,0.6),0_0_28px_rgba(91,229,132,0.08)]"
                >
                  {/* Top specular hairline on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/45 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#5BE584]/25 bg-[#5BE584]/10 text-[#5BE584] transition-all duration-300 group-hover:border-[#5BE584]/50 group-hover:bg-[#5BE584]/15 group-hover:shadow-[0_0_18px_rgba(91,229,132,0.2)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#94A3B8] transition-colors group-hover:text-[#5BE584]">
                      {feature.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC] mb-2 transition-colors group-hover:text-[#5BE584]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Workflow Highlights */}
      <section
        id="workflows"
        className="relative overflow-hidden w-full border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_bottom_right,rgba(91,229,132,0.07),transparent_50%)] text-[#F8FAFC] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16"
      >
        <div className="relative z-10 mx-auto w-full max-w-[1280px]">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#5BE584] uppercase">
              Role-Based Workflows
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
              Tailored for Coaches and Members
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              STREN adapts its navigation, dashboards, and tools to your role while keeping
              training data connected across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ROLE_WORKFLOWS.map((workflow) => {
              const Icon = workflow.icon;
              return (
                <div
                  key={workflow.role}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-6 sm:p-8 shadow-[0_14px_44px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#5BE584]/35 hover:shadow-[0_18px_48px_-12px_rgba(0,0,0,0.65),0_0_32px_rgba(91,229,132,0.07)]"
                >
                  {/* Top specular accent */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/45 to-transparent"
                  />
                  {/* Corner ambient glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-[#5BE584]/[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-xs font-semibold text-[#5BE584]">
                        <Icon className="h-3.5 w-3.5" />
                        {workflow.badge}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                        {workflow.role}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                      {workflow.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-[#94A3B8] leading-relaxed">
                      {workflow.description}
                    </p>

                    <ul className="mt-6 space-y-3 border-t border-[#2A3039] pt-6">
                      {workflow.steps.map((step) => (
                        <li
                          key={step}
                          className="flex items-start gap-2.5 text-sm text-[#F8FAFC]"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584] mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

