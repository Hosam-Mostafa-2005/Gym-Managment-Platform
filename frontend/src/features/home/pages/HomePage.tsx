import React from "react";
import {
  Sparkles,
  ArrowRight,
  Activity,
  Users,
  Calendar,
  Dumbbell,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 p-4 md:p-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card p-6 shadow-sm backdrop-blur-xl md:p-10 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Background Glow Effect (Optional for modern look) */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        {/* Welcome Column */}
        <div className="flex flex-col justify-between space-y-6 z-10">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gym Management Platform</span>
            </div>

            {/* Greeting with Gradient */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Good Morning,{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                Hosam
              </span>{" "}
              👋
            </h1>

            {/* Description */}
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Welcome back. Manage your members, track active workouts, and
              monitor today's training sessions all in one place.
            </p>
          </div>

          {/* Quick Mini-Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40 max-w-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Trainers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Focus Card */}
        <div className="mt-8 flex flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-lg relative overflow-hidden lg:mt-0">
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Calendar className="h-4 w-4" />
                Today's Focus
              </span>
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold leading-snug tracking-tight">
              Stay on top of today's coaching.
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              You have{" "}
              <strong className="text-foreground">3 pending assignments</strong>{" "}
              to review and 2 training plans expiring today.
            </p>
          </div>

          {/* Action Button inside Card */}
          <div className="pt-6 z-10">
            <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]">
              <span>Review Assignments</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
