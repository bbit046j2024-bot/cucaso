"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Image as ImageIcon,
  X,
  Sparkles,
  MapPin,
  Loader2,
  ExternalLink,
  FolderOpen,
  Images,
} from "lucide-react";
import { normalizeGoogleImageUrl, isGoogleAlbumOrFolder, getAlbumTypeLabel } from "@/lib/utils";

type GalleryItem = {
  id: string;
  category: string;
  title: string;
  location?: string;
  caption?: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  date?: string;
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = ["All", "Rallies", "Fellowship", "Worship", "Leadership", "Community", "Sports"];

  // Fetch live gallery items from the API (same source as admin portal)
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data);
        }
      })
      .catch((err) => {
        console.warn("Gallery API unavailable, using fallback:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch when category filter changes
  useEffect(() => {
    if (loading) return; // Skip on initial load (handled above)
    const url =
      activeCategory === "All"
        ? "/api/gallery"
        : `/api/gallery?category=${encodeURIComponent(activeCategory)}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => {
        const itemCat = item.category?.toLowerCase() || "";
        const activeCat = activeCategory.toLowerCase();
        if (activeCat.startsWith("rall") && itemCat.startsWith("rall")) return true;
        return itemCat === activeCat;
      });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 text-white py-14 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-3">
              Gallery: Moments that Inspire
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Snapshots of vibrant worship, fellowship, student leadership, and
              community service from past Coastal Adventist rallies and campus
              revivals.
            </p>
          </div>
        </section>

        {/* Filter Navigation */}
        <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat
                      ? "bg-navy-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <span className="text-sm font-medium">Loading gallery…</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-24 text-slate-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No photos in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group bg-white rounded-3xl p-3 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                      <img
                        src={normalizeGoogleImageUrl(item.imageUrl)}
                        alt={item.altText || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-gallery.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div>
                          <h3 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                            {item.caption || item.description || ""}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                        <span className="bg-navy-950/80 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm pointer-events-auto">
                          {item.category}
                        </span>
                        {(isGoogleAlbumOrFolder(item.imageUrl) || item.description?.includes("Album:")) && (
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border border-white/20 shadow-sm flex items-center gap-1 pointer-events-auto">
                            <Images className="w-3 h-3" />
                            <span>Shared Album</span>
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-md text-white p-1.5 rounded-full border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>
                    <div className="pt-3 px-1 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.location || "Coastal Region"}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {(isGoogleAlbumOrFolder(item.imageUrl) || item.description?.includes("Album:")) ? "View Album" : "Click to expand"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Fullscreen Lightbox Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/90 backdrop-blur-md animate-in fade-in">
            <div className="relative max-w-4xl w-full bg-navy-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-navy-950/80 text-white hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative max-h-[70vh] min-h-[320px] w-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={normalizeGoogleImageUrl(selectedItem.imageUrl)}
                  alt={selectedItem.altText || selectedItem.title}
                  className="max-h-[70vh] w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-gallery.jpg";
                  }}
                />
              </div>

              {(() => {
                const isAlbum = isGoogleAlbumOrFolder(selectedItem.imageUrl) || selectedItem.description?.includes("Album:");
                const albumLink = selectedItem.description?.includes("Album:")
                  ? selectedItem.description.split("Album:")[1]?.trim()
                  : (isGoogleAlbumOrFolder(selectedItem.imageUrl) ? selectedItem.imageUrl : null);

                return (
                  <>
                    {isAlbum && albumLink && (
                      <div className="bg-teal-950/90 border-b border-teal-800/60 p-3 px-6 text-teal-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Images className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="font-semibold">Shared Photo Collection ({getAlbumTypeLabel(albumLink)})</span>
                        </div>
                        <a
                          href={albumLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-teal-300 hover:text-white underline flex items-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Browse all photos in this Google Album</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-950">
                      <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                          {selectedItem.category} • {selectedItem.location || "Coastal Region"}
                          {selectedItem.date ? ` • ${selectedItem.date}` : ""}
                        </span>
                        <h3 className="font-heading font-black text-xl text-white mt-1">
                          {selectedItem.title}
                        </h3>
                        <p className="text-sm text-slate-300 mt-1 max-w-xl">
                          {selectedItem.caption || selectedItem.description?.split(" | Album:")[0] || ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        {isAlbum && albumLink ? (
                          <a
                            href={albumLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                          >
                            <FolderOpen className="w-4 h-4 text-white" />
                            <span>Open Full Album ({getAlbumTypeLabel(albumLink)})</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={normalizeGoogleImageUrl(selectedItem.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-teal-300" />
                            <span>Direct Link</span>
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-bold text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
