"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Bell,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Megaphone,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Newspaper,
  AlertCircle,
} from "lucide-react";
import type { NewsPost } from "@/types";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ANNOUNCEMENT:    { label: "Official Notice",    color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Megaphone className="w-3 h-3" /> },
  NEWS:            { label: "News",               color: "bg-teal-50 text-teal-700 border-teal-200",   icon: <Newspaper className="w-3 h-3" /> },
  STORY:           { label: "Campus Spotlight",   color: "bg-blue-50 text-blue-700 border-blue-200",   icon: <Sparkles className="w-3 h-3" /> },
  DEVOTIONAL:      { label: "Pastoral Letter",    color: "bg-rose-50 text-rose-700 border-rose-200",   icon: <BookOpen className="w-3 h-3" /> },
  TESTIMONY:       { label: "Testimony",          color: "bg-purple-50 text-purple-700 border-purple-200", icon: <ShieldCheck className="w-3 h-3" /> },
  FINANCE:         { label: "Treasury",           color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <ShieldCheck className="w-3 h-3" /> },
  SPIRITUAL:       { label: "Spiritual",          color: "bg-rose-50 text-rose-700 border-rose-200",   icon: <BookOpen className="w-3 h-3" /> },
};

function getCatConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat.replace(/_/g, " "), color: "bg-slate-50 text-slate-600 border-slate-200", icon: <Bell className="w-3 h-3" /> };
}

const FILTER_TABS = [
  { id: "ALL",          label: "All Bulletins" },
  { id: "ANNOUNCEMENT", label: "Official Notices" },
  { id: "FINANCE",      label: "Treasury" },
  { id: "SPIRITUAL",    label: "Pastoral" },
  { id: "STORY",        label: "Campus Spotlights" },
  { id: "DEVOTIONAL",   label: "Devotionals" },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Only show published posts
        setNews(json.data.filter((n: NewsPost) => n.status === "PUBLISHED" || !n.status));
      } else {
        setError("Could not load news. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = news.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = filtered.find((n) => n.status === "PUBLISHED");

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
                CUCASO News &amp; Bulletins
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Stay updated with verified circulars, Council decisions, campus mission reports, and
                upcoming regional rally announcements.
              </p>
              {!loading && (
                <p className="mt-3 text-teal-400 text-xs font-bold">
                  {news.length} bulletin{news.length !== 1 ? "s" : ""} published
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="bg-white border-b border-slate-200 sticky top-20 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_TABS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-navy-950 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 w-40"
                  />
                </div>
                <button
                  onClick={fetchNews}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                  title="Refresh news"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Loading */}
            {loading && (
              <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-semibold">Loading news from database…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="py-16 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-3">{error}</p>
                <button
                  onClick={fetchNews}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="py-20 text-center">
                <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-500">
                  {searchQuery || selectedCategory !== "ALL"
                    ? "No news matches your filter."
                    : "No published news yet."}
                </p>
                {(searchQuery || selectedCategory !== "ALL") && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
                    className="mt-3 text-xs text-teal-600 font-bold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* News grid */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((item) => {
                  const catCfg = getCatConfig(item.category);
                  const dateStr = item.publishedAt || item.createdAt;
                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Featured image */}
                      {item.featuredImageUrl && (
                        <div className="h-40 overflow-hidden bg-slate-100">
                          <img
                            src={item.featuredImageUrl}
                            alt={item.altText || item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                          />
                        </div>
                      )}

                      <div className="p-6 md:p-8 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${catCfg.color}`}>
                            {catCfg.icon}
                            {catCfg.label}
                          </span>
                          {dateStr && (
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(dateStr).toLocaleDateString("en-KE", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading font-bold text-lg text-navy-950 mb-3 leading-snug group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h2>

                        {item.summary && (
                          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3 font-body">
                            {item.summary}
                          </p>
                        )}
                      </div>

                      <div className="px-6 pb-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.author || "CUCASO Secretariat"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {item.readTime && <span className="text-slate-400">{item.readTime} ·</span>}
                          <span className="text-teal-700 font-bold flex items-center gap-0.5">
                            Read <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
