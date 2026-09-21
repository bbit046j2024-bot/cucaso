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
        if (json.success && json.data) {
          setCurrentRally(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const formattedDate = currentRally.startDate ? (
    `${new Date(currentRally.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(currentRally.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  ) : "Nov 15 - 17, 2026";

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
            <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Photo Left */}
                <div
                  className="lg:col-span-6 relative h-64 sm:h-80 lg:h-96 w-full"
                  style={{
                    backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/027/716/506/small_2x/people-hand-up-in-the-concert-hall-music-event-generative-ai-photo.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 bg-navy-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-amber-400">
                    NEXT OFFICIAL RALLY
                  </div>
                </div>

                {/* Details Right */}
                <div className="lg:col-span-6 p-6 sm:p-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>{formattedDate}</span>
                  </div>

                  <div>
                    <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                      {currentRally.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 mt-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{currentRally.venueName || currentRally.venueLocation || "Mombasa Sports Complex, Mombasa Island, Kenya"}</span>
                    </p>
                  </div>

                  {/* Countdown Timer Blocks */}
                  <div className="pt-2">
                    <RallyCountdown targetDate={currentRally.startDate || "2026-11-15T08:00:00"} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/apply"
                      className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
                <div>
                  <h2 className="font-heading font-black text-2xl text-navy-950 mb-2">
                    Official 3-Day Rally Programme
                  </h2>
                  <p className="text-sm text-slate-500">
                    Structured schedule for delegates, choirs, chapter leaders, and institutional heads.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Day 1 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-navy-950 text-white font-bold text-xs flex items-center justify-center">
                        D1
                      </span>
                      <div>
                        <h4 className="font-heading font-bold text-base text-navy-950">
                          Day 1 — Friday 15 Nov: Arrival, Accreditation & Opening Vesper
                        </h4>
                        <span className="text-xs text-teal-700 font-semibold">02:00 PM — 09:30 PM</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 ml-11 list-disc list-outside">
                      <li><strong>02:00 PM - 05:00 PM:</strong> Chapter delegate registration, badge issuance & dormitory allocations.</li>
                      <li><strong>05:30 PM - 06:45 PM:</strong> Coastal chapter roll call & sunset opening devotion.</li>
                      <li><strong>07:00 PM - 09:30 PM:</strong> Keynote Address I: <em>&quot;Anchored in the Storm&quot;</em> followed by mass prayer.</li>
                    </ul>
                  </div>

                  {/* Day 2 */}
                  <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                        D2
                      </span>
                      <div>
                        <h4 className="font-heading font-bold text-base text-navy-950">
                          Day 2 — Saturday 16 Nov: Sabbath Worship, Workshops & Music Extravaganza
                        </h4>
                        <span className="text-xs text-amber-800 font-semibold">08:00 AM — 09:00 PM</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 ml-11 list-disc list-outside">
                      <li><strong>08:00 AM - 09:30 AM:</strong> Sabbath School Bible study across combined campus panels.</li>
                      <li><strong>10:00 AM - 12:30 PM:</strong> Divine Service Sermon by Invited Guest Speaker with 2,400+ delegates.</li>
                      <li><strong>01:00 PM - 02:30 PM:</strong> Fellowship Lunch & Inter-institutional networking.</li>
                      <li><strong>02:45 PM - 05:00 PM:</strong> Breakout Workshops (Campus Leadership, Health Outreach, Career Mentorship).</li>
                      <li><strong>05:30 PM - 08:30 PM:</strong> Coastal Grand Choir Festival & sunset musical praise.</li>
                    </ul>
                  </div>

                  {/* Day 3 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-navy-950 text-white font-bold text-xs flex items-center justify-center">
                        D3
                      </span>
                      <div>
                        <h4 className="font-heading font-bold text-base text-navy-950">
                          Day 3 — Sunday 17 Nov: Community Impact & Commissioning Service
                        </h4>
                        <span className="text-xs text-teal-700 font-semibold">08:30 AM — 01:00 PM</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 ml-11 list-disc list-outside">
                      <li><strong>08:30 AM - 10:30 AM:</strong> Mombasa town cleanliness drive & literature distribution.</li>
                      <li><strong>11:00 AM - 12:30 PM:</strong> Commissioning and Passing of the Mantle to new chapter officers.</li>
                      <li><strong>01:00 PM:</strong> Lunch & Departure of delegations.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VENUE TAB */}
            {activeTab === "venue" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      Rally Location
                    </span>
                    <h2 className="font-heading font-black text-2xl text-navy-950 mt-3 mb-3">
                      Mombasa Sports Complex
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      Centrally situated on Mombasa Island, the Sports Complex provides a safe, covered main auditorium with modern acoustics, separate workshop break-out halls, dining pavilions, and secure parking.
                    </p>
                    <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p><strong>Address:</strong> Mnazi Mmoja Rd, Mombasa Island, Kenya</p>
                      <p><strong>Security:</strong> Controlled badge gate access with 24-hr security and CCTV</p>
                      <p><strong>Medical:</strong> Dedicated Red Cross first-aid tent and standby ambulance</p>
                    </div>
                  </div>

                  <div className="relative h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                    <Image
                      src="/mombasa-coast.jpg"
                      alt="Mombasa Sports Complex Surroundings"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. FEES TAB */}
            {activeTab === "fees" && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-heading font-black text-2xl text-navy-950 mb-2">
                    Capability-Based Fair Capitation
                  </h2>
                  <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                    CUCASO does not charge exorbitant individual gates. We calculate an institutional capitation fee based on chapter membership and institutional capability tier so no student is turned away.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-teal-700 uppercase">Tier 1: Major Universities</span>
                    <h4 className="font-heading font-black text-xl text-navy-950 mt-1 mb-2">KSh 350,000 - 420,000</h4>
                    <p className="text-xs text-slate-500">For universities with large student bodies (TUM, Pwani University). Covers main auditorium subsidization.</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-amber-700 uppercase">Tier 2: Tertiary Colleges</span>
                    <h4 className="font-heading font-black text-xl text-navy-950 mt-1 mb-2">KSh 180,000 - 280,000</h4>
                    <p className="text-xs text-slate-500">For polytechnics and medical training colleges (Mombasa Poly, Kenya Medical, Diani College).</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-blue-700 uppercase">Tier 3 & 4: Emerging & Schools</span>
                    <h4 className="font-heading font-black text-xl text-navy-950 mt-1 mb-2">KSh 80,000 - 150,000</h4>
                    <p className="text-xs text-slate-500">Subsidized capitation for secondary institutions and newly formed coastal fellowships.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-700 flex-shrink-0" />
                  <span>Payments are made strictly to Centralized Paybill <strong>4082200</strong> with Account Number assigned on the Chapter Invoice.</span>
                </div>
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
