"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RallyCountdown } from "@/components/rally-countdown";
import { EmbeddedCoastalMap } from "@/components/embedded-coastal-map";
import { 
  MEMBER_CHAPTERS as FALLBACK_CHAPTERS, 
  CURRENT_RALLY, 
  GALLERY_ITEMS 
} from "@/lib/data";
import { Chapter } from "@/types";
import { 
  ChevronRight, 
  Users, 
  Calendar, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  GraduationCap, 
  HeartHandshake, 
  Sprout,
  ArrowRight,
  Home as HomeIcon
} from "lucide-react";

export default function HomePage() {
  const [chapters, setChapters] = useState<Chapter[]>(FALLBACK_CHAPTERS);

  useEffect(() => {
    // Fetch live chapters from database API
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setChapters(json.data);
        }
      })
      .catch((err) => {
        console.warn("Using local chapter dataset fallback:", err);
      });
  }, []);

  const top3Leaders = [
    {
      name: "Dr. James Mwangi",
      role: "Chairperson",
      title: "CUCASO Executive Council",
      image: "/leaders/james-mwangi.jpg",
    },
    {
      name: "Prof. Grace Achieng",
      role: "Vice Chairperson",
      title: "Academic & Governance Affairs",
      image: "/leaders/grace-achieng.jpg",
    },
    {
      name: "Pastor Daniel Otieno",
      role: "Secretary",
      title: "Secretariat & Records",
      image: "/leaders/daniel-otieno.jpg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white pb-16 lg:pb-0 font-body">
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. HERO SECTION — Full-bleed logo background */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center border-b border-navy-900">
          {/* ── Full-bleed logo background ── */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/logo.jpeg"
              alt="CUCASO background"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/50" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-navy-950/60 to-transparent" />
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            {/* Tagline */}
            <p className="text-teal-300 text-sm font-bold uppercase tracking-widest mb-3">
              One Family. One Mission. Unite. Equip. Empower.
            </p>

            {/* Headline */}
            <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1.05] mb-6 max-w-4xl">
              Stronger Together<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400">
                for a Greater Mission
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl font-body">
              Uniting Adventist universities, colleges and schools along the Mombasa coast through faith, fellowship, transparent capability funding, and shared annual rallies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/apply"
                className="px-8 py-4 rounded-full bg-amber-400 text-navy-950 font-black text-sm shadow-xl hover:bg-amber-300 transition-all flex items-center gap-2"
              >
                <span>Register your chapter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/rallies"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-teal-300" />
                <span>Rally information</span>
              </Link>
            </div>
          </div>

          {/* Subtle bottom live indicator */}
          <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Mombasa Coastal Fellowship — Live</span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. WHY WE EXIST (Matches image1.png & image2.png)          */}
        {/* ========================================================= */}
        <section id="about" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                  Why We Exist
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Anchored on biblical principles and institutional cooperation
                </p>
              </div>
              <Link
                href="/about"
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
              >
                <span>Read our full story</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Unity in Christ */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                  Unity in Christ
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bringing our campus family together in faith, fellowship and spiritual service across all institutions.
                </p>
              </div>

              {/* Card 2: Stronger Institutions */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                  Stronger Institutions
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Supporting and empowering our chapters and students with equitable capability-based resource sharing.
                </p>
              </div>

              {/* Card 3: Greater Impact */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                  Greater Impact
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Building a better future for our coastal communities through youth mobilization, mission, and outreach.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/* 4. NEXT RALLY BANNER CARD                                  */}
        {/* ========================================================= */}
        <section id="rally" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative rounded-3xl border border-slate-800/30 shadow-2xl overflow-hidden"
              style={{
                backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/027/716/506/small_2x/people-hand-up-in-the-concert-hall-music-event-generative-ai-photo.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Cinematic dark overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/55" />

              {/* Container Content */}
              <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                    Next Rally
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Registration Open
                  </span>
                </div>

                <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white mb-2 tracking-tight">
                  {CURRENT_RALLY.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-medium">15 – 17 November 2026</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-medium">{CURRENT_RALLY.venueName}</span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="mb-6">
                  <RallyCountdown targetDate={CURRENT_RALLY.startDate} variant="dark" />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/apply"
                    className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-sm shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/rallies"
                    className="text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    View Full Details & Schedule →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. HOW IT WORKS FOR CHAPTERS (Matches image1.png)          */}
        {/* ========================================================= */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                How It Works for Chapters
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                A simple, transparent process built for institutional cooperation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-950 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-md">
                  1
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy-950 mb-1">
                    Apply
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Submit your chapter application online and receive accreditation from the council.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-950 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-md">
                  2
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy-950 mb-1">
                    Register Attendees
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Add your student delegates and patrons in the self-service chapter portal.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-950 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-md">
                  3
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy-950 mb-1">
                    Pay Once
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Receive your capability-based fee, make one single payment via M-Pesa Paybill, and you&apos;re ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. DUAL SECTION: GALLERY & LEADERSHIP (Matches image1.png) */}
        {/* ========================================================= */}
        <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Gallery Preview */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-black text-xl text-navy-950">
                      Gallery
                    </h3>
                    <Link
                      href="/gallery"
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      View gallery →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Moments from Our Rallies</p>

                  {/* Thumbnail Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {GALLERY_ITEMS.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        href="/gallery"
                        className="relative h-28 rounded-2xl overflow-hidden group border border-slate-200 shadow-sm block"
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/40 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Over 500+ rally memories archived</span>
                  <Link
                    href="/gallery"
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>Browse All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Our Council & Leadership Preview */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-black text-xl text-navy-950">
                      Our Council & Leadership
                    </h3>
                    <Link
                      href="/leadership"
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      Meet the team →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Committed to serve</p>

                  {/* 3 Leadership Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {top3Leaders.map((ldr, i) => (
                      <Link key={i} href="/leadership" className="text-center group block">
                        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-200 shadow-md mb-3 group-hover:border-teal-500 transition-all">
                          <Image
                            src={ldr.image}
                            alt={ldr.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h5 className="font-heading font-bold text-xs text-navy-950 leading-tight line-clamp-1 group-hover:text-teal-700">
                          {ldr.name}
                        </h5>
                        <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                          {ldr.role}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 text-center">
                  <span className="text-xs text-slate-500">
                    12 Executive Officers • All Heads of Institution
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* ========================================================= */}
      {/* 7. MOBILE VIEW BOTTOM NAV BAR (Matches image1.png & image2.png) */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 flex items-center justify-around shadow-lg">
        <Link href="/" className="flex flex-col items-center text-navy-900 text-[10px] font-bold">
          <HomeIcon className="w-5 h-5 mb-0.5 text-navy-900" />
          <span>Home</span>
        </Link>
        <Link href="/chapters" className="flex flex-col items-center text-slate-500 text-[10px] font-bold">
          <Building2 className="w-5 h-5 mb-0.5 text-slate-500" />
          <span>Chapters</span>
        </Link>
        <Link href="/rallies" className="flex flex-col items-center text-slate-500 text-[10px] font-bold">
          <Calendar className="w-5 h-5 mb-0.5 text-slate-500" />
          <span>Rallies</span>
        </Link>
        <Link href="/portal" className="flex flex-col items-center text-teal-700 text-[10px] font-bold">
          <Users className="w-5 h-5 mb-0.5 text-teal-700" />
          <span>Portal</span>
        </Link>
      </div>
    </div>
  );
}
