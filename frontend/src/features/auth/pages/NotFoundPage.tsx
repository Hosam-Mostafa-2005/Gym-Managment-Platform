import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#090B0F] px-4 text-center text-[#F8FAFC]">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[20px] border border-[#2A3039] bg-[#13171D] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#5BE584]/15 text-[#5BE584]">
          <Dumbbell className="h-6 w-6" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5BE584]">
          Error 404
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/dashboard"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-4 text-sm font-semibold text-[#090B0F] transition-colors hover:bg-[#49D472]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-4 text-sm font-semibold text-[#F8FAFC] transition-colors hover:bg-[#1B2028]"
          >
            Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
