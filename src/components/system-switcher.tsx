"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

export function SystemSwitcher() {
  const pathname = usePathname();

  const isPublic = pathname === "/" || pathname === "/apply" || pathname.startsWith("/#");
  const isPortal = pathname.startsWith("/portal") && !pathname.includes("/admin");
  const isCouncil = pathname.includes("/council") || pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-navy-950/90 text-white backdrop-blur-lg px-3 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-1.5 text-xs font-semibold">
      <span className="hidden sm:inline-block px-2 text-slate-400 font-medium tracking-wider text-[11px] uppercase border-r border-slate-700 mr-1">
        CUCASO System View:
      </span>

      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
          isPublic
            ? "bg-amber-500 text-navy-950 font-bold shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Public Website</span>
      </Link>

      <Link
        href="/portal"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
          isPortal
            ? "bg-teal-500 text-navy-950 font-bold shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Chapter Portal</span>
      </Link>

      <Link
        href="/portal/council"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
          isCouncil
            ? "bg-white text-navy-950 font-bold shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin Panel</span>
      </Link>
    </div>
  );
}
