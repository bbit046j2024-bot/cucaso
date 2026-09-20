"use client";

import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative bg-navy-950 text-slate-300 overflow-hidden">
      {/* Curved Oceanic Wave Top (Matches image1.png & image2.png) */}
      <div className="w-full overflow-hidden leading-none bg-slate-50">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-12 sm:h-16 md:h-24 text-navy-950 preserve-3d"
        >
          <path 
            d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" 
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="dark" size="lg" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mt-3">
              Uniting Seventh-day Adventist universities, colleges, and schools across the Mombasa coastal region through shared faith, ministry, transparent capability funding, and annual rally fellowship.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase pt-2">
              <span>Unity</span>
              <span>•</span>
              <span>Fellowship</span>
              <span>•</span>
              <span>Mission</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Why We Exist
                </Link>
              </li>
              <li>
                <Link href="/chapters" className="hover:text-white transition-colors">
                  Member Chapters
                </Link>
              </li>
              <li>
                <Link href="/rallies" className="hover:text-white transition-colors">
                  Coastal Unity Rally 2026
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Rally Moments Gallery
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold">
                  <span>Register Chapter</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Council */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
              Governance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/leadership" className="hover:text-white transition-colors">
                  Executive Council & Officers
                </Link>
              </li>
              <li>
                <Link href="/leadership#heads" className="hover:text-white transition-colors">
                  Heads of Institution
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Chapter Portal (Dashboard)
                </Link>
              </li>
              <li>
                <Link href="/portal?mode=ADMIN" className="hover:text-white transition-colors">
                  Admin Panel (Dashboard)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Secretariat Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
              Secretariat
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Mombasa Sports Complex & Coast Field Secretariat, Mombasa, Kenya</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+254 712 345 678 / +254 722 445 566</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>secretariat@cucaso.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching design mockup */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 border-t border-navy-800/80">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/chapters" className="hover:text-white transition-colors">Chapters</Link>
            <Link href="/rallies" className="hover:text-white transition-colors">Rallies</Link>
            <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <Link href="/leadership" className="hover:text-white transition-colors">Leadership</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {/* Facebook */}
            <a href="#" className="w-8 h-8 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center hover:text-white hover:border-teal-400 transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* X / Twitter */}
            <a href="#" className="w-8 h-8 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center hover:text-white hover:border-teal-400 transition-colors" aria-label="X">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-8 h-8 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center hover:text-white hover:border-teal-400 transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* YouTube */}
            <a href="#" className="w-8 h-8 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center hover:text-white hover:border-teal-400 transition-colors" aria-label="YouTube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Coastal Universities and Colleges Adventist Students Organization (CUCASO). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
