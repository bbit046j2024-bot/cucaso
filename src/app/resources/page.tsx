"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { 
  BookOpen, 
  FileText, 
  Download, 
  Heart, 
  Send, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Bookmark, 
  HelpCircle,
  Clock,
  Shield,
  Search
} from "lucide-react";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"spiritual" | "documents" | "prayer">("spiritual");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerData, setPrayerData] = useState({
    name: "",
    emailOrPhone: "",
    request: "",
    isPrivate: true,
  });

  const spiritualResources = [
    {
      category: "Bible Study",
      title: "Christ in the Sanctuary: A Youth Guide",
      description: "Comprehensive 8-part Bible study series exploring the Sanctuary doctrine and Christ's high-priestly ministry.",
      format: "PDF Series",
      downloads: "1,240 downloads",
    },
    {
      category: "Sabbath Resources",
      title: "Coastal Campus Sabbath School Outlines (Q1 2026)",
      description: "Discussion guides tailored for university and tertiary college student Sabbath School classes and afternoon forums.",
      format: "PDF Document",
      downloads: "890 downloads",
    },
    {
      category: "Devotionals",
      title: "Anchored in the Storm: 30 Devotions for Coastal Students",
      description: "Daily reflections addressing campus exams, mental health, career purity, and Sabbath observance on campus.",
      format: "eBook / PDF",
      downloads: "2,150 downloads",
    },
    {
      category: "Evangelism",
      title: "Campus Ministry Evangelism Handbook",
      description: "Practical steps for personal soul-winning, literature distribution, and staging campus health expos.",
      format: "Handbook",
      downloads: "670 downloads",
    },
  ];

  const documents = [
    {
      title: "CUCASO Official Constitution (Revised 2024)",
      category: "Organizational",
      access: "Public",
      date: "September 2024",
      size: "1.4 MB",
    },
    {
      title: "Rally Financial Policy & Capability-Weighted Capitation Framework",
      category: "Financial / PRD",
      access: "Public",
      date: "August 2024",
      size: "820 KB",
    },
    {
      title: "Chapter Chartering Application & Endorsement Guide",
      category: "Governance",
      access: "Public",
      date: "July 2024",
      size: "540 KB",
    },
    {
      title: "Under-18 Minor Attendee Guardian Consent Form",
      category: "KDPA Compliance",
      access: "Public",
      date: "January 2026",
      size: "310 KB",
    },
    {
      title: "Executive Council Minutes & Resolutions (Tier Approvals)",
      category: "Council",
      access: "Members Only",
      date: "Q4 2025",
      size: "2.1 MB",
    },
    {
      title: "Rally Venue Safety, Medical & Emergency Preparedness Protocol",
      category: "Operations",
      access: "Leaders Only",
      date: "February 2026",
      size: "1.1 MB",
    },
  ];

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                Proposal §13 & §15
              </span>
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-white mt-4 mb-4">
                Spiritual Resources & Document Centre
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Empowering Adventist students across the Coast with authoritative Bible study guides, official constitutional policies, and a dedicated pastoral prayer network.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 sticky top-20 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("spiritual")}
                className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "spiritual"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Spiritual Resources (§13)</span>
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "documents"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Document Centre (§15)</span>
              </button>
              <button
                onClick={() => setActiveTab("prayer")}
                className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "prayer"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Prayer Requests</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Spiritual Resources */}
        {activeTab === "spiritual" && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spiritualResources.map((item) => (
                  <div key={item.title} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        {item.category}
                      </span>
                      <h3 className="font-heading font-bold text-xl text-navy-950 mt-3 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <span>{item.format} • {item.downloads}</span>
                      <a
                        href="/resources/sample-devotional.pdf"
                        download
                        className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Document Centre */}
        {activeTab === "documents" && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-heading font-black text-xl text-navy-950">Official CUCASO Repository</h3>
                    <p className="text-xs text-slate-500">Constitutional documents, financial guidelines, and registration forms</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Tiered Access:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Public</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Members</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Leaders</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Document Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-center">Clearance</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc) => (
                        <tr key={doc.title} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-bold text-navy-950 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>{doc.title}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600">{doc.category}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.access === "Public" 
                                ? "bg-emerald-100 text-emerald-800"
                                : doc.access === "Members Only"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}>
                              {doc.access}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{doc.date}</td>
                          <td className="py-4 px-4 text-right">
                            {doc.access === "Public" ? (
                              <a
                                href="#download"
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors inline-flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Get ({doc.size})</span>
                              </a>
                            ) : (
                              <Link
                                href="/login"
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Login to View</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Prayer Requests */}
        {activeTab === "prayer" && (
          <section className="py-12 md:py-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-black text-2xl text-navy-950">
                    Submit a Prayer Request
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    &ldquo;Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.&rdquo; — Philippians 4:6
                  </p>
                </div>

                {prayerSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-heading font-bold text-base text-emerald-950">
                      Prayer Request Received
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your prayer burden has been logged and shared with the CUCASO Chaplaincy & Prayer Intercessors team. May the Lord strengthen and uphold you.
                    </p>
                    <button
                      onClick={() => setPrayerSubmitted(false)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePrayerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Your Name (or Leave Empty for Anonymous)
                      </label>
                      <input
                        type="text"
                        value={prayerData.name}
                        onChange={(e) => setPrayerData({ ...prayerData, name: e.target.value })}
                        placeholder="e.g. Bro. Dennis / Anonymous"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Phone or Email (Optional, for Pastoral Follow-up)
                      </label>
                      <input
                        type="text"
                        value={prayerData.emailOrPhone}
                        onChange={(e) => setPrayerData({ ...prayerData, emailOrPhone: e.target.value })}
                        placeholder="+254 7... or student@tum.ac.ke"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Prayer Burden / Request
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={prayerData.request}
                        onChange={(e) => setPrayerData({ ...prayerData, request: e.target.value })}
                        placeholder="Share your spiritual, academic, family, health or emotional burden..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={prayerData.isPrivate}
                        onChange={(e) => setPrayerData({ ...prayerData, isPrivate: e.target.checked })}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="isPrivate" className="text-xs text-slate-700">
                        <strong>Confidential to Chaplaincy:</strong> Keep strictly private to the CUCASO Chaplain (do not read in public prayer session).
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-500 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Prayer Request</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
