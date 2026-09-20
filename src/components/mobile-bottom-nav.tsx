"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Building2, 
  Calendar, 
  LayoutDashboard,
  ShieldAlert
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't render inside the full-screen portal if on desktop, but keep accessible
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chapters", label: "Chapters", icon: Building2 },
    { href: "/rallies", label: "Rallies", icon: Calendar },
    { href: "/portal", label: "Portal", icon: LayoutDashboard },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                active 
                  ? "text-teal-700 font-bold bg-teal-50/80" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? "text-teal-700 scale-110" : "text-slate-500"}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
