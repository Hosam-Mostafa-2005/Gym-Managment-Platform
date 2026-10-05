import { useNavigate } from "react-router-dom";

export default function OverviewCTA() {
  const navigate = useNavigate();

  return (
    <section className="sticky top-0 z-30 flex min-h-screen w-full flex-col items-center justify-center bg-[#0D1014] border-t border-[#1E2329] text-[#F3F4F6] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center lg:px-12">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white">
          WANT TO EXPLORE <br className="hidden sm:block" />
          <span className="text-[#9CA3AF]">THE FULL EXPERIENCE?</span>
        </h2>

        <p className="mt-8 max-w-xl text-sm md:text-base text-[#6B7280] leading-relaxed">
          Sign in to enter your STREN workspace and begin managing your training
          programs.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-48 rounded-md bg-[#5BE584] px-6 py-3.5 text-sm font-bold tracking-wide text-[#090B0F] transition-all hover:bg-[#4ade80]"
          >
            SIGN IN
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-48 rounded-md border border-[#1E2329] bg-[#101418] px-6 py-3.5 text-sm font-bold tracking-wide text-[#9CA3AF] transition-all hover:border-[#6B7280] hover:text-white"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </section>
  );
}
