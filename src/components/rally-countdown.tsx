"use client";

import { useEffect, useState } from "react";

interface RallyCountdownProps {
  targetDate: string;
  variant?: "light" | "dark";
}

export function RallyCountdown({ targetDate, variant = "light" }: RallyCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 12,
    minutes: 36,
    seconds: 21,
  });

  useEffect(() => {
    const rallyTime = new Date(targetDate).getTime();

    const updateTimer = () => {
      const diff = rallyTime - Date.now();
      if (diff <= 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isDark = variant === "dark";

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 my-4 max-w-sm">
      <div
        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all ${isDark
          ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
          : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
      >
        <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-amber-500">
          {timeLeft.days}
        </span>
        <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Days
        </span>
      </div>

      <div
        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all ${isDark
          ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
          : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
      >
        <span className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          {timeLeft.hours}
        </span>
        <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Hours
        </span>
      </div>

      <div
        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all ${isDark
          ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
          : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
      >
        <span className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          {timeLeft.minutes}
        </span>
        <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Minutes
        </span>
      </div>

      <div
        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all ${isDark
          ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
          : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
      >
        <span className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
          {timeLeft.seconds}
        </span>
        <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Seconds
        </span>
      </div>
    </div>
  );
}
