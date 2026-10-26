// src/components/ui/info-tooltip.tsx
import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  unit?: string;
  dateRange?: string;
  limitations?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  calculation,
  unit,
  dateRange,
  limitations,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`Metric information for ${title}`}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          // If moving focus outside container, close
          if (
            containerRef.current &&
            !containerRef.current.contains(e.relatedTarget as Node)
          ) {
            setIsOpen(false);
          }
        }}
        className="rounded-full p-1 text-[#6B7280] transition-colors hover:bg-[#1E2329] hover:text-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 mb-2 w-72 -translate-x-1/2 rounded-xl border border-[#2A313A] bg-[#101418] p-3.5 text-xs text-[#F3F4F6] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E2329] pb-2 mb-2">
            <span className="font-semibold text-white tracking-tight">
              {title}
            </span>
            {unit && (
              <span className="rounded bg-[#16291D] border border-[#23422E] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#5BE584]">
                {unit}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
            {description}
          </p>

          {/* Calculation */}
          {calculation && (
            <div className="mt-2.5 rounded-md bg-[#0D1014] border border-[#1E2329] p-2">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                Formula
              </span>
              <p className="mt-0.5 text-[10px] text-gray-300 font-mono leading-relaxed">
                {calculation}
              </p>
            </div>
          )}

          {/* Range & Limitations */}
          {(dateRange || limitations) && (
            <div className="mt-2 space-y-1 text-[10px] text-[#6B7280]">
              {dateRange && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[#9CA3AF]">Period:</span>
                  <span>{dateRange}</span>
                </div>
              )}
              {limitations && (
                <div className="text-[10px] text-amber-400/80 leading-tight">
                  <span className="font-medium">Note:</span> {limitations}
                </div>
              )}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#2A313A]" />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
