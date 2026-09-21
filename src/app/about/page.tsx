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
  Sparkles,
  Flame,
  Globe2,
  RefreshCw,
  Share2,
  BookmarkCheck,
  FileText
} from "lucide-react";

export default function AboutPage() {
  const coreValues = [
    {
      title: "Faith",
      desc: "Rooted in Scripture and the teachings of the Seventh-day Adventist Church, anchoring every program and student life in Christ.",
      icon: Flame,
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      title: "Fellowship",
      desc: "Building authentic, lifelong relationships among Adventist students across diverse tertiary campuses and secondary chapters.",
      icon: HeartHandshake,
      color: "text-teal-600 bg-teal-50 border-teal-200"
    },
    {
      title: "Service",
      desc: "Deploying our spiritual gifts, professional skills, and academic training to serve God, church, and coastal communities.",
      icon: Sprout,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      title: "Unity",
      desc: "Working cooperatively across institutions as one indivisible body of believers, celebrating regional brotherhood.",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      title: "Excellence",
      desc: "Encouraging high diligence and holistic Christian standards in spiritual, mental, physical, and academic development.",
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      title: "Evangelism",
      desc: "Sharing the everlasting Gospel of Jesus Christ and the Three Angels' Messages with fellow students and the community.",
      icon: Globe2,
      color: "text-rose-600 bg-rose-50 border-rose-200"
    },
  ];

  const objectives = [
    {
      action: "Nurture",
      title: "Holistic Student Growth",
      desc: "Encouraging spiritual, mental, physical and social development through structured seminars, Bible studies, and wellness retreats.",
      icon: Sprout
    },
    {
      action: "Connect",
      title: "Inter-Campus Fellowship",
      desc: "Strengthening fellowship, mutual understanding, and brotherly love among Adventist students across the Coastal region.",
      icon: HeartHandshake
    },
    {
      action: "Reach",
      title: "Public Evangelism",
      desc: "Supporting campus and coastal evangelistic missions, literature distribution, and outreach to non-Adventist students and communities.",
      icon: Globe2
    },
    {
      action: "Restore",
      title: "Reclaiming Former Members",
      desc: "Seeking in a spirit of Christian love to reach, restore, and reintegrate former members of the Adventist faith through gentle pastoral care.",
      icon: RefreshCw
    },
    {
      action: "Mobilize",
      title: "Coordinated Rallies & Events",
      desc: "Planning and staging inter-institutional weekend spiritual rallies, retreats, choral festivals, and leadership conventions.",
      icon: Building2
    },
    {
      action: "Partner",
      title: "Institutional & Church Liaison",
      desc: "Cultivating cooperative relationships between student chapters, higher education administrations, and the Seventh-day Adventist Church conference leadership.",
      icon: Share2
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="relative overflow-hidden text-white py-20 md:py-28 min-h-[380px] flex items-center">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=80')",
            }}
          />
          {/* Dark overlay — much darker so background is subtle */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/98 via-navy-950/95 to-navy-950/85" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Text flush left */}
          <div className="w-full px-4 sm:px-8 lg:px-16 relative z-10">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6 max-w-3xl">
              About CUCASO: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-300">
                One Community. One Faith. One Mission.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-body">
              The Coastal Universities and Colleges Adventists Students Organization (CUCASO) unites organized Seventh-day Adventist student fellowships across universities, colleges, and schools in Mombasa and the Kenyan coastal region.
            </p>
          </div>
        </section>

        {/* SECTION 6: CONSTITUTIONAL FOUNDATION & MISSION */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Constitutional Foundation</span>
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950">
                  Established to Unite, Nurture and Mobilize
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    The CUCASO Constitution establishes our organization as the official fellowship uniting Adventist students across tertiary and secondary campuses in Mombasa, Kilifi, Kwale, Taita Taveta, and the wider Coastal region.
                  </p>
                  <p>
                    Its establishment is rooted in the shared desire of Adventist youth to encourage one another in academic life, grow in spiritual maturity, share their faith, and actively advance the mission of the Seventh-day Adventist Church.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <h3 className="font-heading font-bold text-navy-950 text-base mb-1">Full Membership</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Conferred upon organized Adventist student chapters within registered universities, constituent colleges, polytechnics, and TVET institutions across the Coast.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <h3 className="font-heading font-bold text-navy-950 text-base mb-1">Associate Membership</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Open to recognized Adventist alumni, patrons, and ministry partners who continue to mentor students, support programs, and share professional guidance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-navy-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
                <h3 className="font-heading font-black text-2xl text-amber-400 mb-4">Our Mission & Purpose</h3>
                <blockquote className="italic text-slate-200 text-sm leading-relaxed mb-6 border-l-2 border-teal-400 pl-4">
                  &ldquo;To foster a united community of Adventist students who grow spiritually, mentally, physically and socially while participating in fellowship, service, evangelism and activities that support the mission of the Seventh-day Adventist Church.&rdquo;
                </blockquote>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  <strong>Our Purpose:</strong> To connect, nurture, empower and mobilize Adventist students for Christian fellowship, active evangelism, leadership integrity, and community impact.
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-teal-300 font-bold">
                  <span>CUCASO Constitution Article 2</span>
                  <Link href="/resources" className="text-amber-400 hover:underline flex items-center gap-1">
                    <span>View Constitution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: CORE VALUES (Proposal Section 7) */}
        <section id="values" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950 mt-3 mb-4">
                Our Core Values
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                These six foundational values reflect the organization&apos;s constitutional foundation and guide every program we undertake.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${v.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-navy-950 mb-3 flex items-center gap-2">
                      <span>{v.title}</span>
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 8: OUR OBJECTIVES (Proposal Section 8 / Article 2) */}
        <section id="objectives" className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-navy-950 mt-3 mb-4">
                Our Constitutional Objectives
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Six dedicated pillars translating our constitutional mandate into tangible campus fellowship and ministry action.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {objectives.map((obj) => {
                const Icon = obj.icon;
                return (
                  <div key={obj.action} className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:border-teal-500/40 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-navy-950 text-white font-mono font-bold text-xs uppercase tracking-wider">
                        {obj.action}
                      </span>
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                      {obj.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA TO REGISTER & GET INVOLVED */}
        <section className="py-16 bg-navy-950 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mb-4">
              Be Part of the Coastal Adventist Movement
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-body">
              Whether you are an incoming university student, a campus chapter leader, an institutional chaplain, or an Adventist alumnus, there is a place for you in CUCASO.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/apply"
                className="px-8 py-3.5 rounded-full bg-amber-400 text-navy-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-md"
              >
                Register Your Chapter
              </Link>
              <Link
                href="/alumni"
                className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Join Alumni Network
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-bold text-xs transition-all"
              >
                Contact Council
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
