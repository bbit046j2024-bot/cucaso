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
      {/* Circular crop — zoomed to just the badge emblem */}
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200"
        style={{ width: s.px, height: s.px }}
      >
        <Image
          src="/logo.jpeg"
          alt="CUCASO Emblem"
          // Render at 2.5× the container so the badge fills it well
          width={Math.round(s.px * 2.5)}
          height={Math.round(s.px * 2.5)}
          // object-cover + object-position shifts into the badge zone.
          // The JPEG is tall portrait; "center 22%" brings the circular
          // emblem (which sits in the upper portion) into view.
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 22%" }}
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
