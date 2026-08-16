import { Activity, ArrowRight, Dumbbell } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";

export const Hero = ({
  user,
  currentSession,
  navigate,
}: {
  user: any;
  currentSession: any;
  navigate: NavigateFunction;
}) => {
  return (
    <section
      className="relative w-full rounded-2xl h-[90vh] min-h-[700px] flex items-center overflow-hidden border-b border-white/5 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/gym-login-hero.png')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      <div className="absolute z-0 left-[-5%] top-[0%] w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
      <div className="absolute z-0 right-[-10%] bottom-[-20%] w-[600px] h-[600px] rounded-full border border-[#5BE584]/20" />
      <div className="absolute z-0 left-[10%] top-[20%] w-[500px] h-[500px] bg-[#5BE584]/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute z-0 right-[15%] top-[25%] w-[400px] h-[400px] bg-[#5BE584]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-10 w-full relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tighter leading-[1.05]">
            <span className="text-white">Train Smarter.</span>
            <br />
            <span className="text-[#5BE584]">Become</span>
            <br />
            <span className="text-[#5BE584]">Stronger.</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-md leading-relaxed">
            Everything you need to track your fitness journey in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            {currentSession ? (
              <button
                onClick={() =>
                  navigate(`/sessions/${currentSession.session.id}`)
                }
                className="group flex items-center justify-center gap-3 bg-[#5BE584] text-[#090B0F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4dd273] transition-all duration-300 shadow-[0_0_40px_rgba(91,229,132,0.25)] hover:shadow-[0_0_60px_rgba(91,229,132,0.4)]"
              >
                <Activity className="w-5 h-5" />
                Continue Workout
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/workouts")}
                className="group flex items-center justify-center gap-3 bg-[#5BE584] text-[#090B0F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#4dd273] transition-all duration-300 shadow-[0_0_40px_rgba(91,229,132,0.25)] hover:shadow-[0_0_60px_rgba(91,229,132,0.4)]"
              >
                <Activity className="w-5 h-5" />
                Start Workout
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button
              onClick={() => navigate("/workouts")}
              className="group flex items-center justify-center gap-3 bg-transparent text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
            >
              Explore Workouts
              <Dumbbell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
};
