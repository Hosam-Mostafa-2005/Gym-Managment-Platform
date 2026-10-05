import { useNavigate } from "react-router-dom";

export default function OverviewHero() {
  const navigate = useNavigate();

  return (
    <section className="sticky top-0 z-10 flex min-h-screen w-full flex-col items-center justify-center bg-[#0D1014] text-[#F3F4F6] overflow-hidden">
      {/* Subtle Technical Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Deep, wide ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.04)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center lg:px-12 animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both">
        {/* STREN Wordmark */}
        <div className="relative flex justify-center items-center">
          {/* Intense, tight glow specifically behind the wordmark */}
          <div className="absolute w-[60%] h-[40%] bg-[#5BE584] opacity-20 blur-[80px] rounded-[100%]" />

          <h1 className="relative z-10 font-black tracking-[-0.04em] leading-none select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-[clamp(4.5rem,20vw,13rem)] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
            STREN
          </h1>
        </div>

        {/* Tagline */}
        <h2 className="mt-4 sm:mt-6 text-xs sm:text-base md:text-xl font-bold tracking-[0.3em] text-[#5BE584] uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
          Train. Track. Progress.
        </h2>

        {/* Supporting Statement */}
        <p className="mt-6 sm:mt-8 max-w-xl text-sm md:text-base text-[#9CA3AF] leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          A connected platform designed for managing your complete training
          journey. Build structured routines, log live sessions, and track
          physical progress with precision.
        </p>

        {/* CTAs */}
        <div className="mt-12 sm:mt-16 flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-64 rounded-lg bg-[#5BE584] px-8 py-4 text-sm font-bold tracking-widest text-[#090B0F] transition-all duration-300 hover:bg-[#4ade80] hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(91,229,132,0.3)] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014]"
          >
            SIGN IN
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-64 rounded-lg border border-transparent bg-transparent px-8 py-3 text-sm font-bold tracking-widest text-[#6B7280] transition-all duration-300 hover:border-[#1E2329] hover:bg-[#101418] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:ring-offset-2 focus:ring-offset-[#0D1014]"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </section>
  );
}
