"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EXECUTIVE_COUNCIL, INSTITUTIONAL_HEADS } from "@/lib/data";
import { 
  Users, 
  ShieldCheck, 
  Award, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2
} from "lucide-react";

export default function LeadershipPage() {
  const [activeTab, setActiveTab] = useState<"council" | "heads">("council");

  const top3Leaders = [
    {
      name: "Dr. James Mwangi",
      role: "Chairperson",
      title: "CUCASO Executive Council",
      institution: "Technical University of Mombasa",
      image: "/leaders/james-mwangi.jpg",
      bio: "Leads the executive administration and liaison with the Seventh-day Adventist Coast Field, university vice-chancellors, and national student associations."
    },
    {
      name: "Prof. Grace Achieng",
      role: "Vice Chairperson",
      title: "Academic & Governance Affairs",
      institution: "Pwani University",
      bio: "Oversees constitutional compliance, capability tier determinations, student grievance resolution, and inter-institutional faculty relations."
    },
    {
      name: "Pastor David Otieno",
      role: "Secretary",
      title: "Secretariat & Records",
      institution: "Mombasa Polytechnic",
      bio: "Coordinates council correspondence, rally venue contracts, official minutes, chapter accreditation records, and administrative communications."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 text-white py-14 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Administration & Governance</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-3">
              Our Council & Leadership
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Committed to transparent stewardship, spiritual mentorship, and equitable representation for all Seventh-day Adventist institutions across the Kenyan coast.
            </p>
          </div>
        </section>

        {/* Top 3 Executive Leaders (Directly matching image1/image2 cards) */}
        <section className="py-14 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Committed to Serve
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mt-2">
                Executive Leadership
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {top3Leaders.map((leader, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center"
                >
                  <div className="relative w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-white shadow-md bg-slate-200">
                    <Image
                      src={leader.image || "/leaders/james-mwangi.jpg"}
                      alt={leader.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                    {leader.role}
                  </span>
                  <h3 className="font-heading font-black text-xl text-navy-950 mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    {leader.title} • {leader.institution}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-body">
                    {leader.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation for Council & Institutional Heads */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-10">
              <button
                onClick={() => setActiveTab("council")}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "council"
                    ? "bg-navy-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Executive Council (12 Members)
              </button>
              <button
                onClick={() => setActiveTab("heads")}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "heads"
                    ? "bg-navy-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Institutional Heads & Patrons
              </button>
            </div>

            {/* 12-Member Council Directory */}
            {activeTab === "council" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {EXECUTIVE_COUNCIL.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                        Position #{member.positionNumber}
                      </span>
                      <h4 className="font-heading font-black text-lg text-navy-950">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-700 font-semibold mb-2">
                        {member.title}
                      </p>
                      <p className="text-xs text-slate-500 mb-3">
                        {member.institution}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-slate-600 leading-relaxed py-3 border-t border-b border-slate-100 mb-4 font-body">
                          {member.bio}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Accredited Council Officer</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {INSTITUTIONAL_HEADS.map((head) => (
                  <div
                    key={head.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                        {head.roleTitle}
                      </span>
                      <h4 className="font-heading font-black text-lg text-navy-950">
                        {head.headName}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mb-3">
                        {head.institution}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span>Head of Institution</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
