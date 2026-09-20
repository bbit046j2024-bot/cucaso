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
  // The logo JPEG is portrait with whitespace — we crop to just the emblem
  // by using a fixed height container with overflow-hidden + object-top
  const sizeMap = {
    sm: { containerW: 40,  containerH: 40,  imgW: 80,  imgH: 80,  textTitle: "text-base",   textSub: "text-[9px]" },
    md: { containerW: 52,  containerH: 52,  imgW: 104, imgH: 104, textTitle: "text-lg",     textSub: "text-[10px]" },
    lg: { containerW: 68,  containerH: 68,  imgW: 136, imgH: 136, textTitle: "text-2xl",    textSub: "text-xs" },
  };

  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Logo emblem — show only the circular emblem, hide portrait whitespace below */}
      <div
        className="relative flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-200"
        style={{ width: s.containerW, height: s.containerH }}
      >
        <Image
          src="/logo.jpeg"
          alt="CUCASO Emblem"
          width={s.imgW}
          height={s.imgH}
          // The logo image is ~930×1200 px. The circular emblem occupies
          // roughly the top 65% of the image. We scale the image to fill
          // the container width, then align to top so the emblem shows.
          className="w-full object-cover object-top"
          style={{ marginTop: 0 }}
          priority
        />
      </div>

      {withText && (
        <div className="flex flex-col">
          <span
            className={`font-heading font-black tracking-tight leading-tight ${
              variant === "dark" ? "text-white" : "text-navy-950"
            } ${s.textTitle}`}
          >
            CUCASO
          </span>
          <span
            className={`font-medium tracking-wide uppercase ${
              variant === "dark" ? "text-teal-300" : "text-teal-700"
            } ${s.textSub}`}
          >
            Coastal Adventist Education
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
