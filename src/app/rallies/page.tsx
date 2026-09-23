"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RallyCountdown } from "@/components/rally-countdown";
import { CURRENT_RALLY, RALLY_COST_ITEMS } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Mic, 
  Music, 
  Award, 
  Compass, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  Building2,
  ChevronDown
} from "lucide-react";

export default function RalliesPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "programme" | "venue" | "fees" | "faqs">("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentRally, setCurrentRally] = useState<any>(CURRENT_RALLY);

  useEffect(() => {
    fetch("/api/rallies")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCurrentRally(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const formattedDate = currentRally?.startDate ? (
    `${new Date(currentRally.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${currentRally.endDate ? new Date(currentRally.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}`
  ) : "Dates TBA";

  const faqs = [
    {
      q: "Who is eligible to attend the Coastal Unity Rally 2026?",
      a: "All bona fide Seventh-day Adventist students, chapter patrons, chaplaincy sponsors, and alumni associated with accredited coastal universities, polytechnics, medical colleges, and high schools."
    },
    {
      q: "How does capitation and attendee registration work?",
      a: "Individual students register through their respective SDA Chapter Executive. The chapter then submits the delegation roster in the portal and pays one capability-based institutional fee."
    },
    {
      q: "What does the registration fee cover?",
      a: "Access to all keynote addresses, specialized breakout workshops, printed rally materials, security credentials, midday meals on Saturday & Sunday, and emergency on-site medical care."
    },
    {
      q: "Are accommodation arrangements provided at Mombasa Sports Complex?",
      a: "The Secretariat negotiates subsidized group rates with nearby Adventist guest houses and hostels. Chapter executives should request hostel allocations via the Chapter Portal."
    },
    {
      q: "Can high school SDA students attend?",
      a: "Yes! High school students from accredited secondary school chapters attend under the direct supervision of their institutional patrons and designated chaplains."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Banner with Photo & Countdown (Directly matching Rally Information (Public) in image1/image2) */}
        <section className="bg-navy-950 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {currentRally ? (
              <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                  {/* Photo Left */}
                  <div
                    className="lg:col-span-6 relative h-64 sm:h-80 lg:h-96 w-full"
                    style={{
                      backgroundImage: `url('${currentRally.posterUrl || "https://static.vecteezy.com/system/resources/thumbnails/027/716/506/small_2x/people-hand-up-in-the-concert-hall-music-event-generative-ai-photo.jpg"}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4 bg-navy-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-amber-400">
                      OFFICIAL CONVENTION
                    </div>
                  </div>

                  {/* Details Right */}
                  <div className="lg:col-span-6 p-6 sm:p-10 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
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
                            currentRally.state === "REGISTRATION_OPEN" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        {(currentRally.state || "REGISTRATION OPEN").replace(/_/g, " ")}
                      </span>
                    </div>

                    <div>
                      <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                        {currentRally.title}
                      </h1>
                      {currentRally.theme && (
                        <p className="text-amber-300 font-semibold text-sm sm:text-base italic mt-1">
                          &ldquo;{currentRally.theme}&rdquo;
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-slate-300 mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{currentRally.venueName || currentRally.venueLocation || "Mombasa Sports Complex, Mombasa Island, Kenya"}</span>
                      </p>
                    </div>

                    {/* Countdown Timer Blocks */}
                    {currentRally.startDate && (
                      <div className="pt-1">
                        <RallyCountdown targetDate={currentRally.startDate} />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {currentRally.state === "REGISTRATION_OPEN" ? (
                        <Link
                          href="/apply"
                          className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                        >
                          <span>Register Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="px-5 py-2.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                          Registration Closed
                        </span>
                      )}
                      <Link
                        href="/portal"
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
                      >
                        Chapter Rep Portal
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 rounded-3xl border border-white/10 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider inline-block mb-3">
                  Official Communication
                </span>
                <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
                  No Official Rally Currently Scheduled
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  There is no active rally in the system at this time. The CUCASO Council Secretariat is coordinating with institutional chapters to schedule the upcoming regional convention.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow transition-all"
                  >
                    Return to Homepage
                  </Link>
                  <Link
                    href="/portal"
                    className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
                  >
                    Admin / Rep Portal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tabbed Content Navigation (Matching image1/image2 mockup) */}
        <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-3 no-scrollbar">
              {[
                { id: "overview", label: "Overview" },
                { id: "programme", label: "Event Programme" },
                { id: "venue", label: "Venue & Access" },
                { id: "fees", label: "Fees & Capitation" },
                { id: "faqs", label: "FAQs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-navy-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-navy-950 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content Panes */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-12 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
                  <h2 className="font-heading font-black text-2xl text-navy-950 mb-3">
                    About {currentRally.title}
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mb-8">
                    The Coastal Unity Rally is a sacred tri-annual convention uniting Seventh-day Adventist students, educators, and leaders across coastal Kenya. Together we worship, undergo rigorous leadership training, and mobilize for evangelistic community impact under the theme: <strong>&quot;{currentRally.theme || "United for a Greater Mission"}&quot;</strong>.
                  </p>

                  <h3 className="font-heading font-bold text-lg text-navy-950 mb-4">
                    What to Expect
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                        <Mic className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-base text-navy-950 mb-1">
                        Inspiring Speakers
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Seasoned evangelists, university professors, and guest pastors delivering spirit-filled keynotes.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                        <Music className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-base text-navy-950 mb-1">
                        Worship & Fellowship
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Harmonious choir ministrations, mass student praises, and inter-campus Sabbath communion.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <Award className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-base text-navy-950 mb-1">
                        Leadership Training
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Practical tracks in campus ministry, financial accountability, and student chapter governance.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-base text-navy-950 mb-1">
                        Networking & Career
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Connect with Adventist professionals, mentors, and fellow delegates across coastal Kenya.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Past Rallies Archive List */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h3 className="font-heading font-bold text-xl text-navy-950 mb-4">
                    Rally Timeline & Archive
                  </h3>
                  <div className="divide-y divide-slate-100">
                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-navy-950">Jun 2025 — Coast Rally</span>
                        <p className="text-xs text-slate-500">Pwani University Campus, Kilifi</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        Completed
                      </span>
                    </div>
                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-navy-950">Nov 2026 — Coastal Unity Rally</span>
                        <p className="text-xs text-slate-500">Mombasa Sports Complex (Current Campaign)</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        Upcoming
                      </span>
                    </div>
                    <div className="py-3.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-navy-950">May 2027 — Regional Revival Rally</span>
                        <p className="text-xs text-slate-500">Kwale / Diani Conference Grounds</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        Planned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROGRAMME TAB */}
            {activeTab === "programme" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-black text-2xl text-navy-950 mb-2">
                      Official Rally Programme
                    </h2>
                    <p className="text-sm text-slate-500">
                      Structured schedule for delegates, choirs, chapter leaders, and institutional heads.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Live Official Schedule</span>
                  </span>
                </div>

                <div className="space-y-6">
                  {(currentRally.programme && currentRally.programme.length > 0) ? (
                    currentRally.programme.map((day: any, dIdx: number) => {
                      const dayNumber = day.dayNumber || dIdx + 1;
                      const isSabbath = dayNumber === 2;
                      return (
                        <div
                          key={dayNumber}
                          className={`p-6 rounded-2xl border transition-all ${
                            isSabbath
                              ? "bg-amber-50/50 border-amber-200"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white ${
                                isSabbath ? "bg-amber-600" : "bg-navy-950"
                              }`}
                            >
                              D{dayNumber}
                            </span>
                            <div>
                              <h4 className="font-heading font-bold text-base text-navy-950">
                                {day.title || `Day ${dayNumber}`}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                {day.timeRange && (
                                  <span
                                    className={`text-xs font-semibold ${
                                      isSabbath ? "text-amber-800" : "text-teal-700"
                                    }`}
                                  >
                                    {day.timeRange}
                                  </span>
                                )}
                                {day.theme && (
                                  <span className="text-xs text-slate-500 font-medium">
                                    • {day.theme}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {day.items && day.items.length > 0 && (
                            <ul className="space-y-2 text-xs text-slate-700 ml-11 list-disc list-outside">
                              {day.items.map((item: string, iIdx: number) => (
                                <li key={iIdx} className="leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Detailed programme schedule will be published by the Council Secretariat soon.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. VENUE TAB */}
            {activeTab === "venue" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      Rally Location & Access
                    </span>
                    <h2 className="font-heading font-black text-2xl text-navy-950 mt-1">
                      {currentRally.venueAccess?.venueTitle || currentRally.venueName || "Mombasa Sports Complex"}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {currentRally.venueAccess?.description ||
                        "Centrally situated on Mombasa Island, the Sports Complex provides a safe, covered main auditorium with modern acoustics, separate workshop break-out halls, dining pavilions, and secure parking."}
                    </p>

                    <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <p className="flex items-start gap-2">
                        <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Address:</strong>
                        <span>{currentRally.venueAccess?.address || currentRally.venueLocation || "Mnazi Mmoja Rd, Mombasa Island, Coast Region, Kenya"}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Security:</strong>
                        <span>{currentRally.venueAccess?.securityInfo || "Controlled badge gate access with 24-hr Kenya Police escort, private security, and round-the-clock CCTV surveillance."}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Medical:</strong>
                        <span>{currentRally.venueAccess?.medicalInfo || "Dedicated Red Cross First Aid mobile station, certified EMT triage nurses, and standby ambulance on-site."}</span>
                      </p>
                      {currentRally.venueAccess?.directions && (
                        <p className="flex items-start gap-2">
                          <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Directions:</strong>
                          <span>{currentRally.venueAccess.directions}</span>
                        </p>
                      )}
                      {currentRally.venueAccess?.parkingInfo && (
                        <p className="flex items-start gap-2">
                          <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Parking:</strong>
                          <span>{currentRally.venueAccess.parkingInfo}</span>
                        </p>
                      )}
                      {currentRally.venueAccess?.accommodationNotes && (
                        <p className="flex items-start gap-2">
                          <strong className="text-navy-950 whitespace-nowrap min-w-[85px]">Lodging:</strong>
                          <span>{currentRally.venueAccess.accommodationNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <div className="relative h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                      <Image
                        src={currentRally.venueAccess?.imageUrl || "/mombasa-coast.jpg"}
                        alt={currentRally.venueAccess?.venueTitle || "Venue"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{currentRally.venueAccess?.address || currentRally.venueLocation || "Mombasa Island, Kenya"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. FEES TAB */}
            {activeTab === "fees" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-heading font-black text-2xl text-navy-950 mb-2">
                    {currentRally.feesAndCapitation?.philosophyTitle || "Capability-Based Fair Capitation"}
                  </h2>
                  <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                    {currentRally.feesAndCapitation?.philosophyText ||
                      "CUCASO does not charge exorbitant individual gates. We calculate an institutional capitation fee based on chapter membership and institutional capability tier so no student is turned away."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {(currentRally.feesAndCapitation?.tiers && currentRally.feesAndCapitation.tiers.length > 0) ? (
                    currentRally.feesAndCapitation.tiers.map((tier: any, tIdx: number) => {
                      const colors = [
                        { tag: "text-teal-700", border: "border-slate-200" },
                        { tag: "text-amber-700", border: "border-slate-200" },
                        { tag: "text-blue-700", border: "border-slate-200" },
                      ];
                      const style = colors[tIdx % colors.length];
                      return (
                        <div key={tier.tierName || tIdx} className={`p-6 rounded-2xl bg-slate-50 border ${style.border}`}>
                          <span className={`text-xs font-bold uppercase ${style.tag}`}>
                            {tier.tierName}
                          </span>
                          <h4 className="font-heading font-black text-xl text-navy-950 mt-1 mb-2">
                            {tier.range}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {tier.description}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      Capitation details configured by Council Secretariat.
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-700 flex-shrink-0" />
                  <span>
                    Payments are made strictly to Centralized Paybill{" "}
                    <strong>{currentRally.feesAndCapitation?.paybillNumber || "4082200"}</strong>.{" "}
                    {currentRally.feesAndCapitation?.accountInstructions || "Account Number: Assigned on Chapter Invoice."}
                  </span>
                </div>

                {currentRally.feesAndCapitation?.deadlineText && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>{currentRally.feesAndCapitation.deadlineText}</span>
                  </div>
                )}
              </div>
            )}

            {/* 5. FAQS TAB */}
            {activeTab === "faqs" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
                <h2 className="font-heading font-black text-2xl text-navy-950 mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left p-4 sm:p-5 font-heading font-bold text-sm text-navy-950 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span>{f.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && (
                        <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 bg-slate-50/50 leading-relaxed border-t border-slate-100">
                          {f.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
