"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Play, Search, X, ChevronLeft, ChevronRight,
  Mic2, Music2, Eye, Clock, BookOpen, Filter,
  ExternalLink, Youtube, Loader2, Tag
} from "lucide-react";
import { getYouTubeEmbedUrl, getYouTubeThumbnail, extractYouTubeId } from "@/lib/youtube";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Sermon {
  id: string;
  type: "SERMON" | "SONG";
  title: string;
  speaker: string;
  description?: string | null;
  youtubeUrl: string;
  thumbnail?: string;
  videoId?: string | null;
  rallyId?: string | null;
  tags?: string | null;
  series?: string | null;
  duration?: string | null;
  viewCount: number;
  publishedAt?: string | null;
}

// ─── Thumbnail Card ───────────────────────────────────────────────────────────
function SermonCard({ sermon, onClick }: { sermon: Sermon; onClick: () => void }) {
  const thumb = sermon.thumbnail || getYouTubeThumbnail(sermon.youtubeUrl);
  const isSermon = sermon.type === "SERMON";
  const tags = sermon.tags ? sermon.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-teal-200 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={sermon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-950 to-teal-900">
            {isSermon ? <Mic2 className="w-12 h-12 text-teal-300 opacity-40" /> : <Music2 className="w-12 h-12 text-teal-300 opacity-40" />}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-red-600 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Type badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border ${
          isSermon
            ? "bg-navy-950/80 text-teal-300 border-teal-600/40"
            : "bg-purple-900/80 text-purple-200 border-purple-500/40"
        }`}>
          {isSermon ? "Sermon" : "Song"}
        </div>

        {/* Duration */}
        {sermon.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono backdrop-blur-sm">
            {sermon.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-teal-700 transition-colors">
          {sermon.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          {isSermon ? <Mic2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" /> : <Music2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
          {sermon.speaker}
        </p>

        {sermon.series && (
          <p className="text-[11px] text-teal-600 font-semibold truncate">{sermon.series}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3" /> {sermon.viewCount.toLocaleString()} views
          </span>
          {sermon.publishedAt && (
            <span className="text-[11px] text-slate-400">
              {new Date(sermon.publishedAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({
  sermon, onClose, onPrev, onNext, hasPrev, hasNext,
}: {
  sermon: Sermon; onClose: () => void;
  onPrev: () => void; onNext: () => void;
  hasPrev: boolean; hasNext: boolean;
}) {
  const embedUrl = getYouTubeEmbedUrl(sermon.youtubeUrl) + "&autoplay=1";
  const tags = sermon.tags ? sermon.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const isSermon = sermon.type === "SERMON";

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [hasPrev, hasNext, onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-5xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-white/10">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isSermon ? "bg-teal-900/80 text-teal-300" : "bg-purple-900/80 text-purple-300"
              }`}>
                {isSermon ? "Sermon" : "Song"}
              </span>
              {sermon.series && (
                <span className="text-[11px] text-slate-400 font-medium">{sermon.series}</span>
              )}
            </div>
            <h2 className="text-white font-bold text-base leading-snug line-clamp-2">{sermon.title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{sermon.speaker}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player */}
        <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={sermon.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {sermon.description && (
            <p className="text-slate-400 text-sm line-clamp-2">{sermon.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-white/5 text-slate-300 rounded-full text-[11px]">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {/* Nav arrows */}
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href={sermon.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
                YouTube
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "SERMON" | "SONG">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch sermons
  const fetchSermons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        page: String(page),
        ...(activeTab !== "ALL" && { type: activeTab }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/sermons?${params}`);
      const data = await res.json();
      if (data.success) {
        setSermons(data.data);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    fetchSermons();
  }, [fetchSermons]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [activeTab, debouncedSearch]);

  const totalPages = Math.ceil(total / LIMIT);

  const selectedSermon = selectedIdx !== null ? sermons[selectedIdx] : null;

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0a1628] pt-24 pb-16">
        {/* CUCASO logo watermark background */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/logo.png')",
            backgroundSize: "55%",
            backgroundPosition: "center center",
            opacity: 0.06,
          }}
        />
        {/* background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300897b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest">
            <Youtube className="w-3.5 h-3.5" /> CUCASO Media Library
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Sermons &{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Songs
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Spirit-filled messages and worship music from CUCASO rallies across the Coast Region.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, speaker, or tag…"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-teal-400" /> {total} {total === 1 ? "item" : "items"}</span>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 py-3 overflow-x-auto">
          {(["ALL", "SERMON", "SONG"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? tab === "SONG"
                    ? "bg-purple-700 text-white shadow-md shadow-purple-200"
                    : "bg-teal-700 text-white shadow-md shadow-teal-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "ALL" && <Filter className="w-3.5 h-3.5" />}
              {tab === "SERMON" && <Mic2 className="w-3.5 h-3.5" />}
              {tab === "SONG" && <Music2 className="w-3.5 h-3.5" />}
              {tab === "ALL" ? "All Media" : tab === "SERMON" ? "Sermons" : "Songs"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading media…</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              {activeTab === "SONG" ? <Music2 className="w-9 h-9 text-slate-400" /> : <Mic2 className="w-9 h-9 text-slate-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-700">No {activeTab === "ALL" ? "media" : activeTab.toLowerCase() + "s"} found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {debouncedSearch ? `No results for "${debouncedSearch}". Try a different search.` : "Check back soon — content will be added here after each rally."}
            </p>
            {debouncedSearch && (
              <button onClick={() => setSearch("")} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sermons.map((sermon, idx) => (
              <SermonCard
                key={sermon.id}
                sermon={sermon}
                onClick={() => setSelectedIdx(idx)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* ── Video Modal ── */}
      {selectedSermon !== null && selectedIdx !== null && (
        <VideoModal
          sermon={selectedSermon}
          onClose={() => setSelectedIdx(null)}
          onPrev={() => setSelectedIdx((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setSelectedIdx((i) => (i !== null && i < sermons.length - 1 ? i + 1 : i))}
          hasPrev={selectedIdx > 0}
          hasNext={selectedIdx < sermons.length - 1}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
}
