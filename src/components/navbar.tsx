"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./brand-logo";
import { 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown,
  Shield, 
  Building2, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Mail, 
  LogIn,
  Home,
  BookOpen,
  GraduationCap,
  Heart,
  Newspaper,
  HeartHandshake
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary desktop navigation links
  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/chapters", label: "Chapters" },
    { href: "/rallies", label: "Rallies" },
    { href: "/resources", label: "Resources" },
    { href: "/news", label: "News" },
  ];

  // Secondary items in the "More" desktop dropdown
  const moreLinks = [
    { href: "/alumni", label: "Alumni Network", icon: GraduationCap, desc: "Mentorship & associate membership" },
    { href: "/partners", label: "Partners & Supporters", icon: HeartHandshake, desc: "Church & institutional sponsors" },
    { href: "/support", label: "Donate / Support", icon: Heart, desc: "Sponsor student rallies & missions" },
    { href: "/gallery", label: "Photo Gallery", icon: ImageIcon, desc: "Rally memories and choral festivals" },
    { href: "/leadership", label: "Leadership & Council", icon: Users, desc: "Executive Council & officer terms" },
    { href: "/contact", label: "Contact Centre", icon: Mail, desc: "Secretariat & general inquiries" },
  ];

  // All links for mobile drawer
  const allMobileLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About CUCASO", icon: Shield },
    { href: "/chapters", label: "Member Chapters", icon: Building2 },
    { href: "/rallies", label: "Spiritual Rallies", icon: Calendar },
    { href: "/resources", label: "Spiritual Resources & Docs", icon: BookOpen },
    { href: "/news", label: "News & Bulletins", icon: Newspaper },
    { href: "/alumni", label: "Alumni Community", icon: GraduationCap },
    { href: "/support", label: "Donate / Support", icon: Heart },
    { href: "/partners", label: "Partners & Sponsors", icon: HeartHandshake },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/leadership", label: "Leadership Organogram", icon: Users },
    { href: "/contact", label: "Contact Centre", icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const isMoreActive = moreLinks.some(link => pathname.startsWith(link.href));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <BrandLogo variant="light" size="md" href="/" />
        </div>

        {/* DESKTOP NAVIGATION (Always visible on desktop from md: 768px and up) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-3 flex-wrap">
          {primaryLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs lg:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-all relative ${
                  active 
                    ? "text-teal-800 font-bold bg-teal-50/80" 
                    : "text-slate-700 hover:text-teal-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-teal-600 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* "More" Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              onMouseEnter={() => setMoreDropdownOpen(true)}
              className={`text-xs lg:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                isMoreActive || moreDropdownOpen
                  ? "text-teal-800 font-bold bg-teal-50/80"
                  : "text-slate-700 hover:text-teal-700 hover:bg-slate-50"
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180 text-teal-700" : "text-slate-400"}`} />
            </button>

            {/* Dropdown — wide horizontal grid, no icons */}
            {moreDropdownOpen && (
              <div
                onMouseLeave={() => setMoreDropdownOpen(false)}
                className="absolute mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-4 px-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{ minWidth: "480px", left: "50%", transform: "translateX(-50%)" }}
              >
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Community &amp; Ministry
                </p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                  {moreLinks.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          active ? "text-teal-700 font-bold" : "text-slate-700 hover:text-teal-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/apply"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-teal-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
          >
            Register Chapter
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 shadow-sm hover:shadow transition-all flex items-center gap-1.5 group"
          >
            <span>Login</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE (Strictly visible on mobile screens only: md:hidden) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-teal-800 border border-teal-600/40 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE NAV DRAWER (Visible when mobileMenuOpen is true on small screens) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 flex flex-col gap-1 shadow-xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          {allMobileLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-semibold py-2 px-3 rounded-xl transition-all ${
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

          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl border border-amber-500/40 text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 font-bold text-center text-xs transition-all"
            >
              Register Your Chapter
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-navy-900 text-white font-bold text-center text-xs shadow-md hover:bg-navy-800 flex items-center justify-center gap-1.5 transition-all"
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
