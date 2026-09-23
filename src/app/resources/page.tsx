"use client";

import { useState, useEffect } from "react";
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
  Clock,
  Shield,
  Search,
  RefreshCw,
  Loader2,
  ExternalLink,
  File,
  FolderOpen,
} from "lucide-react";
import type { ResourceDocument } from "@/types";

// ── Category labels & colors ──────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  CONSTITUTION:  { label: "Constitutional", color: "bg-blue-100 text-blue-800 border-blue-200" },
  POLICY:        { label: "Policy / PRD",   color: "bg-amber-100 text-amber-800 border-amber-200" },
  FORM:          { label: "Form",           color: "bg-teal-100 text-teal-800 border-teal-200" },
  REPORT:        { label: "Report",         color: "bg-purple-100 text-purple-800 border-purple-200" },
  MINUTES:       { label: "Minutes",        color: "bg-slate-100 text-slate-700 border-slate-200" },
  SPIRITUAL:     { label: "Spiritual",      color: "bg-rose-100 text-rose-800 border-rose-200" },
  OTHER:         { label: "Other",          color: "bg-slate-100 text-slate-600 border-slate-200" },
};

const ACCESS_META: Record<string, { label: string; color: string }> = {
  PUBLIC:       { label: "Public",       color: "bg-emerald-100 text-emerald-800" },
  MEMBERS_ONLY: { label: "Members Only", color: "bg-blue-100 text-blue-800" },
  LEADERS_ONLY: { label: "Leaders Only", color: "bg-purple-100 text-purple-800" },
};

function getCategoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { label: cat, color: "bg-slate-100 text-slate-600 border-slate-200" };
}
function getAccessMeta(level: string) {
  return ACCESS_META[level] ?? ACCESS_META["PUBLIC"];
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"spiritual" | "documents" | "prayer">("spiritual");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerData, setPrayerData] = useState({
    name: "",
    emailOrPhone: "",
    request: "",
    isPrivate: true,
  });

  // ── Documents state (dynamic from DB) ──────────────────────────────────────
  const [documents, setDocuments] = useState<ResourceDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const res = await fetch("/api/resources");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDocuments(json.data);
      } else {
        setDocsError("Could not load documents. Please try again.");
      }
    } catch {
      setDocsError("Network error. Please check your connection.");
    } finally {
      setDocsLoading(false);
    }
  }

  const filteredDocs = documents.filter(
    (d) =>
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate spiritual docs vs formal docs
  const spiritualDocs = filteredDocs.filter(
    (d) =>
      d.category?.toUpperCase() === "SPIRITUAL" ||
      d.category?.toUpperCase() === "BIBLE_STUDY" ||
      d.category?.toUpperCase() === "DEVOTIONAL"
  );
  const formalDocs = filteredDocs.filter(
    (d) =>
      d.category?.toUpperCase() !== "SPIRITUAL" &&
      d.category?.toUpperCase() !== "BIBLE_STUDY" &&
      d.category?.toUpperCase() !== "DEVOTIONAL"
  );

  const [prayerSubmitting, setPrayerSubmitting] = useState(false);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerSubmitting(true);
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prayerData.name,
          emailOrPhone: prayerData.emailOrPhone,
          requestText: prayerData.request,
          isPrivate: prayerData.isPrivate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPrayerSubmitted(true);
      } else {
        alert("Failed to submit: " + (json.error || "Please try again."));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setPrayerSubmitting(false);
    }
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
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-white mt-4 mb-4">
                Spiritual Resources &amp; Document Centre
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Empowering Adventist students across the Coast with authoritative Bible study guides,
                official constitutional policies, and a dedicated pastoral prayer network.
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
                <span>Spiritual Resources</span>
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
                <span>Document Centre</span>
                {!docsLoading && documents.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black">
                    {documents.length}
                  </span>
                )}
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

        {/* Tab 1: Spiritual Resources — LIVE from DB */}
        {activeTab === "spiritual" && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-heading font-black text-2xl text-navy-950">
                    Spiritual Publications &amp; Study Guides
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Biblical doctrine, devotional materials, and campus ministry handbooks coordinated by the CUCASO Chaplaincy.
                    {!docsLoading && (
                      <span className="ml-1 text-teal-600 font-bold">
                        — {spiritualDocs.length} spiritual publication{spiritualDocs.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search spiritual resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 shadow-sm"
                    />
                  </div>
                  <button
                    onClick={fetchDocs}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-colors shadow-sm"
                    title="Refresh resources"
                  >
                    <RefreshCw className={`w-4 h-4 ${docsLoading ? "animate-spin text-teal-600" : ""}`} />
                  </button>
                </div>
              </div>

              {docsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-4 shadow-sm">
                      <div className="flex justify-between">
                        <div className="h-5 w-24 bg-slate-200 rounded" />
                        <div className="h-5 w-16 bg-slate-100 rounded" />
                      </div>
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                      <div className="h-14 w-full bg-slate-100 rounded" />
                      <div className="h-9 w-full bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : spiritualDocs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 shadow-sm">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-sm">No spiritual resources found</p>
                  <p className="text-xs mt-1">
                    {searchQuery ? "No matches found for your search query." : "New study guides and devotionals will be published here once gazetted."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs font-bold text-teal-600 hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {spiritualDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                            {doc.category}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {doc.accessLevel}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-xl text-navy-950 mb-2 group-hover:text-teal-800 transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                        <span>
                          {doc.fileSize || "PDF"} {doc.uploadedBy ? `• ${doc.uploadedBy}` : ""}
                        </span>
                        {doc.url && doc.url !== "#" ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Read / Download</span>
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs">
                            Available in Chapter
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Document Centre — LIVE from DB */}
        {activeTab === "documents" && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-heading font-black text-xl text-navy-950">
                      Official CUCASO Repository
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Constitutional documents, financial guidelines, and registration forms
                      {!docsLoading && (
                        <span className="ml-1 text-teal-600 font-bold">
                          — {documents.length} document{documents.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500">Tiered Access:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Public</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Members</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Leaders</span>
                    <button
                      onClick={fetchDocs}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-colors"
                      title="Refresh documents"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents by title or category…"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                {/* Loading */}
                {docsLoading && (
                  <div className="py-16 text-center">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-semibold">Loading documents from database…</p>
                  </div>
                )}

                {/* Error */}
                {!docsLoading && docsError && (
                  <div className="py-10 text-center">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-500">{docsError}</p>
                    <button
                      onClick={fetchDocs}
                      className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Table */}
                {!docsLoading && !docsError && (
                  <>
                    {filteredDocs.length === 0 ? (
                      <div className="py-12 text-center">
                        <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-500">
                          {searchQuery ? "No documents match your search." : "No documents uploaded yet."}
                        </p>
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4">Document Title</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4 text-center">Clearance</th>
                              <th className="py-3 px-4">Size</th>
                              <th className="py-3 px-4">Uploaded</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {formalDocs.map((doc) => {
                              const catMeta = getCategoryMeta(doc.category);
                              const accMeta = getAccessMeta(doc.accessLevel);
                              const isPublic = doc.accessLevel === "PUBLIC";
                              return (
                                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-4 px-4 font-bold text-navy-950">
                                    <div className="flex items-start gap-2">
                                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="block">{doc.title}</span>
                                        {doc.description && (
                                          <span className="block font-normal text-slate-500 text-[10px] mt-0.5 max-w-xs line-clamp-1">
                                            {doc.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${catMeta.color}`}>
                                      {catMeta.label}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${accMeta.color}`}>
                                      {accMeta.label}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                                    {doc.fileSize ?? "—"}
                                  </td>
                                  <td className="py-4 px-4 text-slate-500 text-[11px]">
                                    {doc.createdAt
                                      ? new Date(doc.createdAt).toLocaleDateString("en-KE", {
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "—"}
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    {isPublic && doc.url && doc.url !== "#" ? (
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors inline-flex items-center gap-1"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
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
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Show spiritual docs in table too if not shown above */}
                        {spiritualDocs.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5" />
                              Spiritual &amp; Devotional Resources
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {spiritualDocs.map((doc) => (
                                <DocumentCard key={doc.id} doc={doc} compact />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
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
                    &ldquo;Do not be anxious about anything, but in every situation, by prayer and
                    petition, present your requests to God.&rdquo; — Philippians 4:6
                  </p>
                </div>

                {prayerSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-heading font-bold text-base text-emerald-950">
                      Prayer Request Received
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your prayer burden has been logged and shared with the CUCASO Chaplaincy &amp;
                      Prayer Intercessors team. May the Lord strengthen and uphold you.
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
                        onChange={(e) =>
                          setPrayerData({ ...prayerData, emailOrPhone: e.target.value })
                        }
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
                        onChange={(e) =>
                          setPrayerData({ ...prayerData, request: e.target.value })
                        }
                        placeholder="Share your spiritual, academic, family, health or emotional burden..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={prayerData.isPrivate}
                        onChange={(e) =>
                          setPrayerData({ ...prayerData, isPrivate: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="isPrivate" className="text-xs text-slate-700">
                        <strong>Confidential to Chaplaincy:</strong> Keep strictly private to the
                        CUCASO Chaplain (do not read in public prayer session).
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={prayerSubmitting}
                      className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-500 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{prayerSubmitting ? "Submitting…" : "Send Prayer Request"}</span>
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

// ── Reusable document card ────────────────────────────────────────────────────
function DocumentCard({ doc, compact = false }: { doc: ResourceDocument; compact?: boolean }) {
  const catMeta = getCategoryMeta(doc.category);
  const accMeta = getAccessMeta(doc.accessLevel);
  const isPublic = doc.accessLevel === "PUBLIC";

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-sm transition-all">
        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-navy-950 truncate">{doc.title}</p>
          <p className="text-[10px] text-slate-500">{doc.fileSize ?? ""}</p>
        </div>
        {isPublic && doc.url && doc.url !== "#" ? (
          <a href={doc.url} target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-[10px] flex items-center gap-1 hover:bg-teal-500 transition-colors shrink-0">
            <Download className="w-3 h-3" />Get
          </a>
        ) : (
          <Link href="/login"
            className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-500 font-bold text-[10px] flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3" />Login
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${catMeta.color}`}>
            {catMeta.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${accMeta.color}`}>
            {accMeta.label}
          </span>
        </div>
        {doc.fileSize && (
          <span className="text-[10px] font-mono text-slate-400 shrink-0">{doc.fileSize}</span>
        )}
      </div>
      <h3 className="font-heading font-bold text-base text-navy-950 mb-1">{doc.title}</h3>
      {doc.description && (
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{doc.description}</p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          {doc.uploadedBy ? `by ${doc.uploadedBy}` : ""}
          {doc.createdAt
            ? ` · ${new Date(doc.createdAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}`
            : ""}
        </span>
        {isPublic && doc.url && doc.url !== "#" ? (
          <a href={doc.url} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-navy-800 transition-colors">
            <Download className="w-3.5 h-3.5" />Download
          </a>
        ) : (
          <Link href="/login"
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 transition-colors">
            <Lock className="w-3 h-3" />Login to View
          </Link>
        )}
      </div>
    </div>
  );
}
