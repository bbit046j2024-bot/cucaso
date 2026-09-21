"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EmbeddedCoastalMap } from "@/components/embedded-coastal-map";
import { MEMBER_CHAPTERS, CAPABILITY_TIERS } from "@/lib/data";
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2
} from "lucide-react";

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<typeof MEMBER_CHAPTERS>(MEMBER_CHAPTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedChapter, setSelectedChapter] = useState<typeof MEMBER_CHAPTERS[0] | null>(null);

  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setChapters(json.data);
        }
      })
      .catch((err) => {
        console.warn("Using fallback chapters dataset", err);
      });
  }, []);

  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => {
      const matchesSearch = 
        ch.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "ALL" || ch.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [chapters, searchQuery, typeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-navy-950 text-white py-14 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Coastal Chapter Directory</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
              Our Member Chapters
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Approved institutions participate through their accredited Seventh-day Adventist student chapters. Explore our 12 coastal chapters, campus locations, and active student delegations.
            </p>
          </div>
        </section>

        {/* Map & Directory Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Interactive Coastal Map Showcase */}
            <div className="mb-12">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-heading font-black text-xl sm:text-2xl text-navy-950">
                      Coastal Institutions Interactive Map
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Geographic distribution of member chapters along the Indian Ocean corridor.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-bold text-navy-950">12 Active Campuses</span>
                  </div>
                </div>
                
                <EmbeddedCoastalMap 
                  chapters={chapters} 
                  selectedChapterId={selectedChapter?.id}
                  onSelectChapter={(ch) => setSelectedChapter(ch)}
                  className="min-h-[500px] rounded-2xl overflow-hidden" 
                />
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapter, university, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-sm"
                />
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {[
                  { id: "ALL", label: "All Institutions" },
                  { id: "UNIVERSITY", label: "Universities" },
                  { id: "COLLEGE", label: "Colleges" },
                  { id: "SECONDARY", label: "Secondary Schools" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      typeFilter === tab.id
                        ? "bg-navy-900 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChapters.map((ch) => {
                const tier = CAPABILITY_TIERS.find((t) => t.id === ch.tierId);
                return (
                  <div
                    key={ch.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                          {ch.type}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                          {tier?.name || "Tier 1"}
                        </span>
                      </div>

                      {/* Header */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-navy-950 text-white font-heading font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                          {ch.code.split("-")[0]}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-navy-950 leading-tight">
                            {ch.institutionName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">{ch.chapterName}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            <span>Location:</span>
                          </span>
                          <span className="font-semibold text-slate-800">{ch.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            <span>Registered Delegates:</span>
                          </span>
                          <span className="font-bold text-navy-950">{ch.attendeesCount || 0} students</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Status:</span>
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Accredited
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/portal?chapter=${ch.id}`}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                      >
                        <span>View In Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setSelectedChapter(ch)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredChapters.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-lg text-navy-950">No Chapters Found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your search keywords or filter selection.
                </p>
              </div>
            )}

            {/* Register New Chapter Callout */}
            <div className="mt-14 bg-gradient-to-r from-teal-800 to-navy-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  New Institutions Welcome
                </span>
                <h3 className="font-heading font-black text-2xl text-white mt-1">
                  Is your campus not listed yet?
                </h3>
                <p className="text-sm text-teal-100 max-w-xl mt-1">
                  Start your chapter accreditation application today. Submit your leadership details and endorsement document for Council review.
                </p>
              </div>
              <Link
                href="/apply"
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <span>Register Your Chapter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* Chapter Details Modal */}
        {selectedChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-navy-950 text-white font-bold flex items-center justify-center">
                  {selectedChapter.code.split("-")[0]}
                </div>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-heading font-black text-xl text-navy-950 mb-1">
                {selectedChapter.institutionName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{selectedChapter.chapterName}</p>

              <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Regional Location:</span>
                  <span className="font-semibold">{selectedChapter.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution Sector:</span>
                  <span className="font-semibold">{selectedChapter.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capability Tier:</span>
                  <span className="font-bold text-teal-700">{selectedChapter.tierId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmed Attendees:</span>
                  <span className="font-bold text-navy-950">{selectedChapter.attendeesCount} Students</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/portal?chapter=${selectedChapter.id}`}
                  className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-bold text-xs text-center hover:bg-navy-800 transition-all"
                >
                  Open Chapter Portal
                </Link>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
