"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { 
  HeartHandshake, 
  GraduationCap, 
  Sprout, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Award, 
  Compass,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="relative overflow-hidden bg-navy-950 text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Our Heritage & Purpose</span>
              </div>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6">
                Why We Exist: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-300">
                  Unity in Faith, Service & Purpose
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-body">
                CUCASO (Coastal Universities and Colleges Adventist Students Organization) brings together Seventh-day Adventist institutions across the Mombasa coastline to cultivate spiritual resilience, campus leadership, and coordinated community impact.
              </p>
            </div>
          </div>
        </section>

        {/* The 3 Core Pillars (From image1.png & image2.png) */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Core Foundations
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950 mt-3 mb-4">
                Three Pillars of Coastal Fellowship
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Our organization is anchored upon timeless biblical values and pragmatic institutional support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy-950 mb-3">
                  Unity in Christ
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Bringing our campus family together in faith, fellowship, and service. We believe student life is transformative when anchored in collective prayer, biblical truth, and spiritual mentorship.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-200/80 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Cross-campus Sabbath fellowships</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Joint musical ministries & choirs</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy-950 mb-3">
                  Stronger Institutions
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Supporting and empowering our chapters and students. From technical universities to polytechnics and medical colleges, every institution receives equitable representation and capacity building.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-200/80 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Capability-based fair capitation fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Student executive governance training</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy-950 mb-3">
                  Greater Impact
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Building a better future for our communities and coast. When thousands of students mobilize together, we execute medical camps, environmental cleanups, and public literature evangelism across Mombasa.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-200/80 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Coastal health and hygiene camps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Youth vocational mentorship</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative & History Section */}
        <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                  <div className="relative h-[400px] w-full">
                    <Image
                      src="/mombasa-coast.jpg"
                      alt="Mombasa Coastline"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block max-w-xs">
                  <div className="text-2xl font-black font-heading text-navy-950">2,486+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delegates across 12 coastal chapters</div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>The Coastal Story</span>
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950">
                  From Campus Fellowships to a Unified Movement
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
                  For years, Seventh-day Adventist students studying across Mombasa, Kilifi, Kwale, and Taita Taveta gathered in isolated campus chapters. Each university faced the steep logistics of organizing retreats, securing rally venues, and navigating administrative hurdles.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-body">
                  In 2024, institutional chaplains, faculty patrons, and student leaders convened to establish **CUCASO**. By pooling resources under a single capability-based funding model, small and large institutions alike now have equal access to world-class rallies, leadership conventions, and mission opportunities.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/chapters"
                    className="px-6 py-3 rounded-full bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span>Explore Member Chapters</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/rallies"
                    className="px-6 py-3 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                  >
                    Next Rally Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Governance Overview */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-navy-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    Administration & Stewardship
                  </span>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mt-4 mb-3">
                    Managed with Transparency & Accountability
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
                    Every shilling contributed through centralized Paybill 4082200 is audited by the CUCASO Administration Council. Chapter dues are calculated through an open Capability Cost Engine that ensures tertiary colleges and secondary schools are never overburdened.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <Link
                    href="/leadership"
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs text-center shadow-md transition-all"
                  >
                    Meet Executive Council
                  </Link>
                  <Link
                    href="/apply"
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs text-center border border-white/20 transition-all"
                  >
                    Accredit Your Chapter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
