import React, { useState, useEffect, useRef } from "react";
import { Timer, X, Play, Pause, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatTimer } from "../utils/session.utils";

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(["workoutSessions", "common"]);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(initialSeconds);

  // Store target end timestamp in milliseconds for drift-free countdown
  const targetEndMsRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const pausedRemainingMsRef = useRef<number>(initialSeconds * 1000);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setTotalTime(initialSeconds);
      setIsPaused(false);
      targetEndMsRef.current = Date.now() + initialSeconds * 1000;
      pausedRemainingMsRef.current = initialSeconds * 1000;
    }
  }, [initialSeconds, isOpen]);

  // Timestamp-based countdown loop
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const tick = () => {
      const now = Date.now();
      const remainingMs = targetEndMsRef.current - now;
      if (remainingMs <= 0) {
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(Math.ceil(remainingMs / 1000));
    };

    tick();
    const interval = setInterval(tick, 250);

    return () => clearInterval(interval);
  }, [isOpen, isPaused]);

  if (!isOpen) return null;

  const isFinished = secondsLeft === 0;
  const progressPercent = totalTime > 0 ? ((totalTime - secondsLeft) / totalTime) * 100 : 100;

  const handleTogglePause = () => {
    if (isPaused) {
      // Resume: set new target end time based on stored remaining ms
      targetEndMsRef.current = Date.now() + pausedRemainingMsRef.current;
      setIsPaused(false);
    } else {
      // Pause: calculate remaining ms and store
      const remainingMs = Math.max(0, targetEndMsRef.current - Date.now());
      pausedRemainingMsRef.current = remainingMs;
      setSecondsLeft(Math.ceil(remainingMs / 1000));
      setIsPaused(true);
    }
  };

  const handleAdd30 = () => {
    if (isPaused) {
      pausedRemainingMsRef.current += 30000;
      setSecondsLeft((s) => s + 30);
    } else {
      targetEndMsRef.current += 30000;
      const remainingMs = Math.max(0, targetEndMsRef.current - Date.now());
      setSecondsLeft(Math.ceil(remainingMs / 1000));
    }
    setTotalTime((t) => t + 30);
  };

  const handleMinus15 = () => {
    if (isPaused) {
      pausedRemainingMsRef.current = Math.max(0, pausedRemainingMsRef.current - 15000);
      setSecondsLeft(Math.ceil(pausedRemainingMsRef.current / 1000));
    } else {
      targetEndMsRef.current = Math.max(Date.now(), targetEndMsRef.current - 15000);
      const remainingMs = Math.max(0, targetEndMsRef.current - Date.now());
      setSecondsLeft(Math.ceil(remainingMs / 1000));
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 rtl:right-auto rtl:left-4 sm:rtl:left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-[calc(100vw-2rem)]">
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 w-[min(20rem,calc(100vw-2rem))] ${
          isFinished
            ? "border-[#5BE584] bg-[#16291D]/95 text-[#5BE584]"
            : "border-[#1E2329] bg-[#0D1014]/95 text-white"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${isFinished ? "text-[#5BE584]" : "text-[#5BE584] animate-pulse"}`} />
            <span className="text-xs font-bold tracking-wide uppercase">
              {isFinished
                ? t("restTimer.restComplete", "Rest Complete!")
                : t("restTimer.restInterval", "Rest Interval")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            aria-label={t("restTimer.dismiss", "Dismiss Rest Timer")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Center Timer Display */}
        <div className="my-4 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-3xl font-extrabold tracking-wider ${
              isFinished ? "text-[#5BE584] animate-bounce" : "text-white"
            }`}
          >
            {isFinished ? t("restTimer.go", "GO!") : formatTimer(secondsLeft)}
          </span>

          {/* Progress Bar */}
          <div className="w-full bg-[#1E2329] rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-linear bg-[#5BE584]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMinus15}
              disabled={isFinished || secondsLeft < 15}
              className="rounded-lg border border-[#1E2329] bg-[#101418] px-2 py-1 text-[11px] font-medium text-[#9CA3AF] hover:text-white hover:border-[#2A313A] disabled:opacity-30 transition-colors font-mono"
            >
              -15s
            </button>
            <button
              onClick={handleAdd30}
              className="rounded-lg border border-[#1E2329] bg-[#101418] px-2 py-1 text-[11px] font-medium text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors font-mono"
            >
              +30s
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {!isFinished && (
              <button
                onClick={handleTogglePause}
                className="rounded-lg border border-[#1E2329] bg-[#101418] p-1.5 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
                title={isPaused ? t("restTimer.resume", "Resume") : t("restTimer.pause", "Pause")}
              >
                {isPaused ? <Play className="h-3.5 w-3.5 rtl:rotate-180" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg bg-[#5BE584] px-3 py-1.5 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>{isFinished ? t("restTimer.nextSet", "Next Set") : t("restTimer.skip", "Skip")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
