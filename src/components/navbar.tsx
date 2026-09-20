"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./brand-logo";
import { 
  Menu, 
  X, 
  ChevronRight, 
  Shield, 
  Building2, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Mail, 
  LogIn,
  Home
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Shield },
    { href: "/chapters", label: "Chapters", icon: Building2 },
    { href: "/rallies", label: "Rallies", icon: Calendar },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/leadership", label: "Leadership", icon: Users },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Official Brand Logo */}
        <BrandLogo variant="light" size="md" href="/" />

        {/* Desktop Navigation (Matches image1.png) */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-all relative py-1.5 ${
                  active 
                    ? "text-teal-700 font-bold" 
                    : "text-slate-700 hover:text-teal-700"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions (Matches image1.png with Login pill button) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/apply"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-teal-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
          >
            Register Chapter
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-navy-900 text-white font-semibold text-sm hover:bg-navy-800 shadow-sm hover:shadow transition-all flex items-center gap-2 group"
          >
            <span>Login</span>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 flex flex-col gap-2 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-base font-semibold py-2.5 px-3 rounded-xl transition-all ${
                  active 
                    ? "bg-teal-50 text-teal-900 font-bold border border-teal-200" 
                    : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-teal-600" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl border border-amber-500/40 text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 font-bold text-center text-sm transition-all"
            >
              Register Your Chapter
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-navy-900 text-white font-bold text-center text-sm shadow-md hover:bg-navy-800 flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Chapter & Council Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
