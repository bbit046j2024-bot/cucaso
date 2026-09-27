"use client";

import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
  href?: string;
}

export function BrandLogo({
  variant = "light",
  size = "md",
  withText = true,
  className = "",
  href = "/",
}: BrandLogoProps) {
  // The JPEG is portrait. The circular badge occupies roughly the
  // top-center portion (before the full org name text below).
  // We zoom in and clip to a circle, aligning to the badge center.
  const sizeMap = {
    sm: { px: 38, textTitle: "text-base", textSub: "text-[9px]" },
    md: { px: 50, textTitle: "text-lg", textSub: "text-[10px]" },
    lg: { px: 64, textTitle: "text-2xl", textSub: "text-xs" },
  };

  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Circular crop — CUCASO emblem badge from logo.png */}
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 bg-white"
        style={{ width: s.px, height: s.px }}
      >
        <Image
          src="/logo.png"
          alt="CUCASO Emblem"
          fill
          sizes={`${s.px}px`}
          className="object-cover object-center"
          priority
        />
      </div>

      {withText && (
        <div className="flex flex-col">
          <span
            className={`font-heading font-black tracking-tight leading-tight ${variant === "dark" ? "text-white" : "text-navy-950"
              } ${s.textTitle}`}
          >
            CUCASO
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
