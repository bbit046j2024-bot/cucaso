"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // in seconds
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState<number>(
    direction === "down" ? value : 0
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTimestamp: number | null = null;
      const duration = 2000; // 2 seconds

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        if (direction === "up") {
          setDisplayValue(easeProgress * value);
        } else {
          setDisplayValue(value - easeProgress * value);
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, direction, delay]);

  return (
    <span
      className={cn(
        "inline-block font-heading tracking-tight tabular-nums",
        className
      )}
    >
      {displayValue.toFixed(decimalPlaces)}
    </span>
  );
}
