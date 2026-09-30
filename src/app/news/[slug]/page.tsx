"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Megaphone,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Newspaper,
  Bell,
  Loader2,
} from "lucide-react";
import type { NewsPost } from "@/types";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ANNOUNCEMENT: { label: "Official Notice",  color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  NEWS:         { label: "News",             color: "text-teal-700",    bg: "bg-teal-50 border-teal-200" },
  STORY:        { label: "Campus Spotlight", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  DEVOTIONAL:   { label: "Pastoral Letter",  color: "text-rose-700",    bg: "bg-rose-50 border-rose-200" },
  TESTIMONY:    { label: "Testimony",        color: "text-purple-700",  bg: "bg-purple-50 border-purple-200" },
  FINANCE:      { label: "Treasury",         color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  SPIRITUAL:    { label: "Spiritual",        color: "text-rose-700",    bg: "bg-rose-50 border-rose-200" },
};

function getCatConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat.replace(/_/g, " "), color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
}

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/news/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setPost(json.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const catCfg = post ? getCatConfig(post.category) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Back nav */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to News & Bulletins
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-teal-500" />
              <p className="text-sm font-semibold">Loading article…</p>
            </div>
          )}

          {/* Not found */}
          {!loading && notFound && (
            <div className="text-center py-24">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h1 className="font-heading font-black text-2xl text-navy-950 mb-2">Article Not Found</h1>
              <p className="text-slate-500 text-sm mb-6">This article may have been removed or is not yet published.</p>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to News
              </Link>
            </div>
          )}

          {/* Article */}
          {!loading && post && (
            <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Featured image */}
              {post.featuredImageUrl && (
                <div className="h-64 md:h-80 overflow-hidden bg-slate-100">
                  <img
                    src={post.featuredImageUrl}
                    alt={post.altText || post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="p-6 md:p-10">
                {/* Category badge */}
                {catCfg && (
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border mb-4 ${catCfg.bg} ${catCfg.color}`}
                  >
                    {catCfg.label}
                  </span>
                )}

                {/* Title */}
                <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-navy-950 leading-tight mb-4">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mb-6 pb-6 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {post.author || "CUCASO Secretariat"}
                  </span>
                  {(post.publishedAt || post.createdAt) && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.publishedAt || post.createdAt!).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.readTime}
                    </span>
                  )}
                </div>

                {/* Summary */}
                {post.summary && (
                  <p className="text-slate-600 text-base leading-relaxed mb-6 font-medium">
                    {post.summary}
                  </p>
                )}

                {/* Body HTML */}
                {post.contentHtml ? (
                  <div
                    className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-navy-950 prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                  />
                ) : (
                  <p className="text-slate-500 italic text-sm">No article body available.</p>
                )}
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}