"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function AdventistBrandSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      role="complementary"
      aria-label="Seventh-day Adventist Organization Watermark"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center select-none group pointer-events-none"
    >
      {/* Pop-out Descriptive Tooltip Card (Appears on Hover / Desktop) */}
      <div
        className={`pointer-events-none absolute right-full mr-3 hidden sm:flex items-center gap-3 bg-navy-950/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-amber-500/20 shadow-2xl text-xs whitespace-nowrap transition-all duration-300 ${
          collapsed
            ? "opacity-0 translate-x-2"
            : "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-black/60 p-1 flex items-center justify-center border border-amber-500/30">
          <Image
            src="/seventh-day-adventist-icon.png"
            alt="Seventh-day Adventist Emblem"
            width={24}
            height={24}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="font-heading font-extrabold text-[12px] text-amber-400 leading-tight">
            Seventh-day Adventist
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Affiliated Student Organization • CUCASO
          </div>
        </div>
      </div>

      {/* Main Docked Ribbon / Brand Tab */}
      <div
        className={`pointer-events-auto transition-transform duration-300 ease-in-out flex items-center ${
          collapsed ? "translate-x-[calc(100%-8px)]" : "translate-x-0"
        }`}
      >
        {/* Collapse / Expand Tab Handle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Show Adventist Brand Tab" : "Hide Adventist Brand Tab"}
          title={collapsed ? "Show Adventist Brand Tab" : "Hide Adventist Brand Tab"}
          className="p-1 -mr-1.5 rounded-l-md bg-navy-900/90 text-amber-400 hover:text-white border-l border-y border-amber-500/20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:opacity-100"
        >
          {collapsed ? (
            <ChevronLeft className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {/* Brand Tab Body */}
        <div
          onClick={() => {
            if (collapsed) setCollapsed(false);
          }}
          className={`flex flex-col items-center bg-navy-950/95 backdrop-blur-md rounded-l-2xl border-l border-y border-amber-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all ${
            collapsed
              ? "cursor-pointer py-3 px-1 bg-amber-500/90 hover:bg-amber-400"
              : "py-2 sm:py-3 px-1 sm:px-1.5"
          }`}
        >
          {/* Adventist Flame & Bible Emblem */}
          <div className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg overflow-hidden flex items-center justify-center p-0.5 bg-black/60 border border-amber-500/20 shadow-inner">
            <Image
              src="/seventh-day-adventist-icon.png"
              alt="Seventh-day Adventist Official Logo"
              width={28}
              height={28}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Micro Divider Accent */}
          <div className="w-2.5 sm:w-3 h-[1.5px] bg-amber-500/60 my-1.5 sm:my-2 rounded-full" />

          {/* Vertical Text (Micro Typography) */}
          <div
            className="[writing-mode:vertical-rl] rotate-180 uppercase font-black tracking-widest text-slate-300 group-hover:text-amber-300 transition-colors cursor-default"
          >
            {/* Desktop Full Name */}
            <span className="hidden md:inline text-[8px] tracking-[0.25em] text-slate-300">
              Adventist
            </span>
            {/* Mobile / Tablet Short Name */}
            <span className="inline md:hidden text-[7px] tracking-wider text-slate-400">
              SDA
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
