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
  CURRENT_RALLY as FALLBACK_RALLY
} from "@/lib/data";
import { normalizeGoogleImageUrl } from "@/lib/utils";
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
  Home as HomeIcon,
  Flame,
  Globe2,
  Award,
  Sparkles,
  BookOpen,
  Heart,
  Newspaper,
  Compass,
  RefreshCw,
  Share2
} from "lucide-react";

export default function HomePage() {
  const [chapters, setChapters] = useState<Chapter[]>(FALLBACK_CHAPTERS);
  const [currentRally, setCurrentRally] = useState<any>(FALLBACK_RALLY);
  const [galleryPreview, setGalleryPreview] = useState<any[]>([]);
  const [topLeaders, setTopLeaders] = useState<any[]>([]);

  // Fetch live chapter data
  useEffect(() => {
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

  // Fetch live rally data from DB
  useEffect(() => {
    fetch("/api/rallies")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCurrentRally(json.data);
        }
      })
      .catch(() => { });
  }, []);

  // Fetch live gallery preview (first 3 items)
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGalleryPreview(json.data.slice(0, 3));
        }
      })
      .catch(() => { });
  }, []);

  // Fetch live leadership directory (top 3 central council officers)
  useEffect(() => {
    fetch("/api/leadership?category=CENTRAL_COUNCIL")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTopLeaders(json.data.slice(0, 3));
        }
      })
      .catch(() => { });
  }, []);

  const coreValues = [
    { title: "Faith", desc: "Rooted in Scripture and the teachings of the Seventh-day Adventist Church.", icon: Flame, color: "text-amber-500 bg-amber-500/10" },
    { title: "Fellowship", desc: "Building meaningful relationships among Adventist students across institutions.", icon: HeartHandshake, color: "text-teal-500 bg-teal-500/10" },
    { title: "Service", desc: "Using our gifts, skills, and academic training to serve God and coastal communities.", icon: Sprout, color: "text-emerald-500 bg-emerald-500/10" },
    { title: "Unity", desc: "Working together across universities and colleges as one undivided student body.", icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { title: "Excellence", desc: "Encouraging high diligence and holistic Christian standards in all endeavors.", icon: Award, color: "text-purple-500 bg-purple-500/10" },
    { title: "Evangelism", desc: "Sharing the everlasting Gospel of Jesus Christ with fellow students and society.", icon: Globe2, color: "text-rose-500 bg-rose-500/10" },
  ];

  const constitutionalObjectives = [
    { action: "Nurture", desc: "Spiritual, mental, physical and social development through campus ministries.", icon: Sprout },
    { action: "Connect", desc: "Inter-campus fellowship and mutual understanding among student chapters.", icon: HeartHandshake },
    { action: "Reach", desc: "Campus soul-winning, literature distribution, and public health expos.", icon: Globe2 },
    { action: "Restore", desc: "Reclaiming former Adventist students through gentle, loving pastoral outreach.", icon: RefreshCw },
    { action: "Mobilize", desc: "Coordinating regional spiritual rallies, conventions, and choral festivals.", icon: Building2 },
    { action: "Partner", desc: "Liaison with university administration and the Seventh-day Adventist Church.", icon: Share2 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white pb-16 lg:pb-0 font-body">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. HERO SECTION — Proposal §25 Welcome Concept           */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center border-b border-navy-900">
          <div className="absolute inset-0 z-0">
            <Image
              src="/logo.jpeg"
              alt="CUCASO background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/60" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-navy-950/80 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] mb-6 max-w-4xl">
              Coastal Universities & Colleges <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-300">
                Adventists Students Organization
              </span>
            </h1>

            <p className="text-base sm:text-xl text-white/80 leading-relaxed mb-8 max-w-3xl font-body">
              Connecting Adventist students across the Coastal region through faith, fellowship, service and mission. Uniting universities, polytechnics, and medical colleges under one regional family.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="px-8 py-4 rounded-full bg-amber-400 text-navy-950 font-black text-sm shadow-xl hover:bg-amber-300 transition-all flex items-center gap-2"
              >
                <span>Explore CUCASO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/rallies"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-teal-300" />
                <span>Upcoming Events & Rallies</span>
              </Link>
              <Link
                href="/apply"
                className="px-6 py-4 rounded-full bg-teal-600/80 hover:bg-teal-500 text-white font-bold text-sm transition-all border border-teal-400/30"
              >
                Join CUCASO
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. WHO WE ARE (Exact Proposal §6 & §25 Content)          */}
        {/* ========================================================= */}
        <section id="about" className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8 space-y-4">
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950">
                  A United Community of Adventist Students
                </h2>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-body">
                  CUCASO brings together Adventist students and organized Adventist groups from universities and colleges across the Coastal region. We exist to nurture fellowship, encourage spiritual and holistic development, coordinate inter-institutional programs and participate in the mission of sharing the Gospel.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-body">
                  From large chartered universities to regional medical colleges and technical polytechnics, CUCASO ensures that no Adventist student stands alone during their higher education journey.
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    <span>Read our full constitutional background</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-heading font-bold text-lg text-navy-950">Our Mission Preview</h3>
                <p className="italic text-xs text-slate-600 border-l-2 border-amber-500 pl-3">
                  &ldquo;To foster a united community of Adventist students who grow spiritually, mentally, physically and socially while participating in fellowship, service, evangelism and activities that support the mission of the Seventh-day Adventist Church.&rdquo;
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/apply"
                    className="py-2.5 px-4 rounded-xl bg-navy-950 text-white font-bold text-xs text-center hover:bg-navy-900 transition-colors"
                  >
                    Register Your Chapter
                  </Link>
                  <Link
                    href="/alumni"
                    className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center hover:bg-slate-100 transition-colors"
                  >
                    Alumni Associate Membership
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CORE VALUES (Proposal §7)                             */}
        {/* ========================================================= */}
        <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-heading font-black text-3xl text-navy-950 mt-2">
                Our Core Values
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Six pillars shaping student life, worship, and leadership across all coastal institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-navy-950 mb-1.5">{v.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. CONSTITUTIONAL OBJECTIVES (Proposal §8)               */}
        {/* ========================================================= */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="font-heading font-black text-3xl text-navy-950 mt-2">
                  Our Constitutional Objectives
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  How CUCASO translates student fellowship into regional impact
                </p>
              </div>
              <Link
                href="/about#objectives"
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View objective breakdown</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {constitutionalObjectives.map((obj) => {
                const Icon = obj.icon;
                return (
                  <div key={obj.action} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-950 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                        {obj.action}
                      </span>
                      <h4 className="font-heading font-bold text-base text-navy-950 mb-1">
                        {obj.action} Adventist Youth
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {obj.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. NEXT RALLY CARD WITH LIVE COUNTDOWN                   */}
        {/* ========================================================= */}
        <section id="rally" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentRally ? (
              <div
                className="relative rounded-3xl border border-slate-800/30 shadow-2xl overflow-hidden"
                style={{
                  backgroundImage: `url('${currentRally.posterUrl || "https://static.vecteezy.com/system/resources/thumbnails/027/716/506/small_2x/people-hand-up-in-the-concert-hall-music-event-generative-ai-photo.jpg"}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/55" />

                <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                      Official Rally
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm ${
                        currentRally.state === "REGISTRATION_OPEN"
                          ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                          : currentRally.state === "FEES_LOCKED"
                          ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
                          : currentRally.state === "IN_PROGRESS"
                          ? "bg-purple-500/20 border-purple-400/30 text-purple-300"
                          : currentRally.state === "COMPLETED"
                          ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                          : "bg-slate-500/20 border-slate-400/30 text-slate-300"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          currentRally.state === "REGISTRATION_OPEN"
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      {(currentRally.state || "REGISTRATION OPEN").replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white mb-2 tracking-tight">
                    {currentRally.title}
                  </h3>

                  {currentRally.theme && (
                    <p className="text-amber-300 font-semibold text-sm sm:text-base italic mb-4">
                      &ldquo;{currentRally.theme}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-200 font-medium">
                        {currentRally.startDate
                          ? new Date(currentRally.startDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
                          : "Dates TBA"}
                        {currentRally.endDate
                          ? ` – ${new Date(currentRally.endDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`
                          : ""}
                      </span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-200 font-medium">{currentRally.venueName || currentRally.venueLocation || "Mombasa, Kenya"}</span>
                    </div>
                    {currentRally.capacity ? (
                      <>
                        <span className="text-slate-500">•</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-200 font-medium">{Number(currentRally.capacity).toLocaleString()} Delegates</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {currentRally.startDate && (
                    <div className="mb-6">
                      <RallyCountdown targetDate={currentRally.startDate} variant="dark" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    {currentRally.state === "REGISTRATION_OPEN" ? (
                      <Link
                        href="/apply"
                        className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-sm shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/rallies"
                        className="px-7 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
                      >
                        <span>View Programme & Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <Link
                      href="/rallies"
                      className="text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                    >
                      View Full Details & Schedule →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl overflow-hidden">
                <div className="max-w-2xl space-y-4">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider">
                    Official Notice
                  </span>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
                    No Active Rally Currently Scheduled
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    The CUCASO Executive Council is planning the upcoming coastal convention. Official dates, venue details, and delegate registration information will be published here once gazetted.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href="/rallies"
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
                    >
                      <span>Explore Past Rallies Archive</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="text-xs text-amber-300 hover:text-amber-200 font-semibold"
                    >
                      Contact Council Secretariat →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. DEVOTIONAL OF THE WEEK & QUICK RESOURCE ACCESS         */}
        {/* ========================================================= */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 p-8 rounded-3xl bg-gradient-to-br from-navy-950 to-slate-900 text-white shadow-xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-2">
                  Spiritual Thought of the Week
                </span>
                <h3 className="font-heading font-black text-2xl text-white mb-3">
                  &ldquo;Standing Firm on the Coastal Shore&rdquo;
                </h3>
                <blockquote className="italic text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 border-l-2 border-teal-400 pl-3">
                  &ldquo;Therefore, my dear brothers and sisters, stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.&rdquo; — 1 Corinthians 15:58
                </blockquote>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  In the midst of difficult semesters, financial challenges, and career decisions, Christ remains our unchanging anchor. Keep your eyes on the Saviour.
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href="/resources"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explore Devotionals</span>
                  </Link>
                  <Link
                    href="/resources"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                  >
                    Submit Prayer Request
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/resources"
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group block"
                >
                  <BookOpen className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-heading font-bold text-base text-navy-950 mb-1">Bible Studies & Outlines</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Download campus study series and Sabbath discussions.</p>
                </Link>

                <Link
                  href="/news"
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group block"
                >
                  <Newspaper className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-heading font-bold text-base text-navy-950 mb-1">News & Bulletins</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Official communications and regional church circulars.</p>
                </Link>

                <Link
                  href="/alumni"
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group block"
                >
                  <GraduationCap className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-heading font-bold text-base text-navy-950 mb-1">Alumni Network</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Connect with Adventist graduates for career coaching.</p>
                </Link>

                <Link
                  href="/support"
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group block"
                >
                  <Heart className="w-8 h-8 text-rose-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-heading font-bold text-base text-navy-950 mb-1">Support & Giving</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Sponsor youth rallies and literature evangelism.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. COASTAL INSTITUTIONS MAP — Full Bleed                 */}
        {/* ========================================================= */}
        <section className="bg-slate-50 border-b border-slate-200">
          {/* Section header (stays in max-w container) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Regional Presence
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mt-2">
                  Member Chapters Along the Coast
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select a chapter from the list or click the map to explore campus locations across Kenya's coast.
                </p>
              </div>
              <Link
                href="/chapters"
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 flex-shrink-0"
              >
                <span>View directory table</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Full-bleed map — no container, no border-radius */}
          <EmbeddedCoastalMap chapters={chapters} fullBleed />
        </section>

        {/* ========================================================= */}
        {/* 8. GALLERY & LEADERSHIP PREVIEW                           */}
        {/* ========================================================= */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-black text-xl text-navy-950">
                      Rally Moments Gallery
                    </h3>
                    <Link
                      href="/gallery"
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      View gallery →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Cherished memories from coastal campus rallies</p>

                  <div className="grid grid-cols-3 gap-3">
                    {galleryPreview.length > 0 ? (
                      galleryPreview.map((item) => (
                        <Link
                          key={item.id}
                          href="/gallery"
                          className="relative h-28 rounded-2xl overflow-hidden group border border-slate-200 shadow-sm block bg-slate-200"
                        >
                          <img
                            src={normalizeGoogleImageUrl(item.imageUrl)}
                            alt={item.altText || item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/placeholder-gallery.jpg"; 
                            }}
                          />
                          <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/40 transition-colors" />
                        </Link>
                      ))
                    ) : (
                      /* Empty state — photos will appear once admin uploads via portal */
                      [0, 1, 2].map((i) => (
                        <Link
                          key={i}
                          href="/gallery"
                          className="relative h-28 rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center group hover:border-teal-400 hover:bg-teal-50 transition-all"
                        >
                          <span className="text-[10px] text-slate-400 font-semibold text-center px-2 group-hover:text-teal-600 transition-colors leading-tight">
                            Photo<br />coming soon
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Memories archived</span>
                  <Link
                    href="/gallery"
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>Browse All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-black text-xl text-navy-950">
                      Administration Council
                    </h3>
                    <Link
                      href="/leadership"
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      Meet the council →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Elected servant leaders and pastoral mentors</p>

                  <div className="grid grid-cols-3 gap-4">
                    {topLeaders.length > 0 ? (
                      topLeaders.map((ldr, i) => {
                        const initials = (ldr.name || "CL").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                        const imgUrl = ldr.imageUrl || ldr.image ? normalizeGoogleImageUrl(ldr.imageUrl || ldr.image) : null;
                        return (
                          <Link key={ldr.id || i} href="/leadership" className="text-center group block">
                            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-200 shadow-md mb-3 group-hover:border-teal-500 transition-all bg-gradient-to-br from-navy-900 to-amber-700 flex items-center justify-center">
                              <span className="font-heading font-black text-sm text-white select-none">{initials}</span>
                              {imgUrl && (
                                <img
                                  src={imgUrl}
                                  alt={ldr.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              )}
                            </div>
                            <h5 className="font-heading font-bold text-xs text-navy-950 leading-tight line-clamp-1 group-hover:text-teal-700">
                              {ldr.name}
                            </h5>
                            <p className="text-[11px] text-teal-700 font-semibold mt-0.5 truncate">
                              {ldr.title || ldr.role || "Officer"}
                            </p>
                          </Link>
                        );
                      })
                    ) : (
                      [0, 1, 2].map((i) => (
                        <div key={i} className="text-center animate-pulse">
                          <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 mb-3" />
                          <div className="h-3 w-16 mx-auto bg-slate-200 rounded mb-1" />
                          <div className="h-2 w-12 mx-auto bg-slate-200 rounded" />
                        </div>
                      ))
                    )}
                  </div>

                </div>

                <div className="pt-4 mt-6 border-t border-slate-200 text-center">
                  <span className="text-xs text-slate-500">
                    12 Executive Officers • Heads of Institution Advisory
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />

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
        <Link href="/resources" className="flex flex-col items-center text-slate-500 text-[10px] font-bold">
          <BookOpen className="w-5 h-5 mb-0.5 text-slate-500" />
          <span>Resources</span>
        </Link>
        <Link href="/portal" className="flex flex-col items-center text-teal-700 text-[10px] font-bold">
          <Users className="w-5 h-5 mb-0.5 text-teal-700" />
          <span>Portal</span>
        </Link>
      </div>
    </div>
  );
}
