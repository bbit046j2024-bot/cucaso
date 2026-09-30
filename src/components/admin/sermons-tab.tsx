"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Mic2,
  Music2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Film,
  Sparkles,
  Filter,
} from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "@/lib/youtube";

interface SermonItem {
  id: string;
  type: "SERMON" | "SONG";
  title: string;
  speaker: string;
  description?: string | null;
  youtubeUrl: string;
  thumbnail?: string;
  thumbnailUrl?: string | null;
  videoId?: string | null;
  rallyId?: string | null;
  chapterId?: string | null;
  tags?: string | null;
  series?: string | null;
  duration?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  viewCount: number;
  publishedAt?: string | null;
  createdAt?: string;
}

export function AdminSermonsTab() {
  const [items, setItems] = useState<SermonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SERMON" | "SONG">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SermonItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<SermonItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "SERMON" as "SERMON" | "SONG",
    title: "",
    speaker: "",
    youtubeUrl: "",
    thumbnailUrl: "",
    series: "",
    duration: "",
    tags: "",
    description: "",
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        limit: "100",
      });
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/sermons?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to load sermons:", err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      type: "SERMON",
      title: "",
      speaker: "",
      youtubeUrl: "",
      thumbnailUrl: "",
      series: "",
      duration: "",
      tags: "",
      description: "",
      status: "PUBLISHED",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SermonItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      speaker: item.speaker,
      youtubeUrl: item.youtubeUrl,
      thumbnailUrl: item.thumbnailUrl || "",
      series: item.series || "",
      duration: item.duration || "",
      tags: item.tags || "",
      description: item.description || "",
      status: item.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formData.speaker.trim()) {
      setFormError("Speaker / Choir / Artist is required.");
      return;
    }
    if (!formData.youtubeUrl.trim()) {
      setFormError("YouTube URL is required.");
      return;
    }

    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      setFormError("Invalid YouTube URL. Please provide a valid YouTube watch, share, or short link.");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        // PATCH
        const res = await fetch(`/api/sermons/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update item");
      } else {
        // POST
        const res = await fetch("/api/sermons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to create item");
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sermons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmId(null);
        fetchItems();
      } else {
        alert(json.error || "Failed to delete item");
      }
    } catch (err) {
      alert("Error deleting sermon");
    }
  };

  const copyShareLink = (sermon: SermonItem) => {
    const url = `${window.location.origin}/sermons?v=${sermon.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(sermon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preview computed video ID
  const previewVideoId = extractYouTubeId(formData.youtubeUrl);

  // Statistics
  const totalCount = items.length;
  const sermonCount = items.filter((i) => i.type === "SERMON").length;
  const songCount = items.filter((i) => i.type === "SONG").length;
  const totalViews = items.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-navy-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700">
              <Film className="w-5 h-5" />
            </span>
            Sermons &amp; Music Archive
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish, organize, and stream YouTube sermons, choral presentations, and spiritual rally messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sermons"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            View Public Page
          </a>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Sermon or Song
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Media</span>
            <Film className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-navy-950 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sermons &amp; songs stored</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 text-xs font-medium">
            <span>Sermons</span>
            <Mic2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-900 mt-2">{sermonCount}</p>
          <p className="text-[11px] text-teal-600/70 mt-0.5">Pulpit &amp; rally messages</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 text-xs font-medium">
            <span>Choral &amp; Songs</span>
            <Music2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-900 mt-2">{songCount}</p>
          <p className="text-[11px] text-purple-600/70 mt-0.5">Choir &amp; musical specials</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">Community engagements</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, speaker, series, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(["ALL", "SERMON", "SONG"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  typeFilter === t
                    ? "bg-white text-navy-950 shadow-sm font-bold"
                    : "text-slate-600 hover:text-navy-950"
                }`}
              >
                {t === "ALL" ? "All Types" : t === "SERMON" ? "Sermons" : "Songs"}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
          <p className="text-xs">Loading media archive...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto text-teal-600 mb-3">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No sermons or songs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {search || typeFilter !== "ALL" || statusFilter !== "ALL"
              ? "No records match your active filters. Try changing or clearing them."
              : "Get started by adding your first YouTube sermon or choir performance from your rallies."}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const thumb = item.thumbnail || getYouTubeThumbnail(item.youtubeUrl);
            const isSermon = item.type === "SERMON";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Video header */}
                  <div
                    onClick={() => setActiveVideo(item)}
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-950 to-teal-900 text-white/40">
                        {isSermon ? <Mic2 className="w-10 h-10" /> : <Music2 className="w-10 h-10" />}
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-red-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                          isSermon
                            ? "bg-navy-950/80 text-teal-300 border-teal-500/40"
                            : "bg-purple-950/80 text-purple-200 border-purple-500/40"
                        }`}
                      >
                        {isSermon ? "Sermon" : "Song"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          item.status === "PUBLISHED"
                            ? "bg-emerald-600/90 text-white"
                            : item.status === "DRAFT"
                            ? "bg-amber-600/90 text-white"
                            : "bg-slate-700/90 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.duration && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono backdrop-blur-sm">
                        {item.duration}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      {isSermon ? (
                        <Mic2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      ) : (
                        <Music2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      )}
                      <span>{item.speaker}</span>
                    </p>

                    {item.series && (
                      <p className="text-[11px] font-semibold text-teal-700 truncate">
                        Series: {item.series}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.viewCount} views
                      </span>
                      {item.publishedAt && (
                        <span>
                          {new Date(item.publishedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyShareLink(item)}
                      title="Copy Public Link"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-200/60 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in YouTube"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-200/60 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-200/60 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                {editingItem ? "Edit Media Entry" : "Add New Sermon or Choral Song"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Type Pill Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "SERMON" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.type === "SERMON"
                        ? "bg-teal-50 border-teal-500 text-teal-800 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Mic2 className="w-4 h-4 text-teal-600" />
                    Sermon (Pulpit Message)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "SONG" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.type === "SONG"
                        ? "bg-purple-50 border-purple-500 text-purple-800 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Music2 className="w-4 h-4 text-purple-600" />
                    Song / Choir Music
                  </button>
                </div>
              </div>

              {/* YouTube URL with live preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Accepts standard YouTube links, share URLs (youtu.be), embed URLs, or YouTube Shorts.
                </p>

                {previewVideoId && (
                  <div className="mt-2.5 p-2 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
                    <img
                      src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`}
                      alt="Preview"
                      className="w-20 aspect-video object-cover rounded-lg border border-slate-300"
                    />
                    <div className="text-[11px] space-y-0.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid YouTube Video ID:
                      </p>
                      <p className="font-mono text-slate-600">{previewVideoId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    formData.type === "SERMON"
                      ? "e.g. Walking in Prophetic Integrity"
                      : "e.g. Tumaini Kuu - CUCASO Mass Choir 2025"
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              {/* Speaker / Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {formData.type === "SERMON" ? "Speaker / Preacher" : "Choir / Artist"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.type === "SERMON" ? "e.g. Pr. Geoffrey Mbwana" : "e.g. TUM SDA Church Choir"
                    }
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Series / Rally Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CUCASO Coast Rally 2025"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Duration and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 42:15 or 5:30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="PUBLISHED">Published (Visible on site)</option>
                    <option value="DRAFT">Draft (Admin only)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evangelism, Youth, Faith, Prayer, 2025 Rally"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Sermon Key Points
                </label>
                <textarea
                  rows={3}
                  placeholder="Key scripture references, sermon overview, or hymn notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? "Save Changes" : "Publish to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Video Player Modal ─────────────────────────────────────────────── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-950 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 px-6 flex items-center justify-between border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                  {activeVideo.type === "SERMON" ? "Sermon Preview" : "Song Preview"}
                </span>
                <h3 className="font-bold text-white text-base leading-tight truncate max-w-md">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              {activeVideo.videoId ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.youtubeUrl, { autoplay: true })}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  Invalid YouTube video link
                </div>
              )}
            </div>

            {/* Modal Details */}
            <div className="p-5 space-y-2 bg-navy-900/60">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-semibold text-teal-300">{activeVideo.speaker}</span>
                {activeVideo.series && (
                  <span className="text-slate-400 font-medium">Series: {activeVideo.series}</span>
                )}
              </div>
              {activeVideo.description && (
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
