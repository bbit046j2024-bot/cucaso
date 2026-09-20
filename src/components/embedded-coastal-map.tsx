"use client";

import { useState, useMemo } from "react";
import { MapPin, Navigation, Compass, Layers, ExternalLink, Settings, Check } from "lucide-react";
import { Chapter } from "@/types";

interface EmbeddedCoastalMapProps {
  chapters: Chapter[];
  selectedChapterId?: string;
  onSelectChapter?: (chapter: Chapter) => void;
  onEditChapterLocation?: (chapter: Chapter) => void;
  className?: string;
  allowToggleView?: boolean;
  isAdmin?: boolean;
}

// Mathematical projection from real GPS (lat, lng) to SVG coastal percentages
function calculateMapPosition(lat?: number, lng?: number, explicitPos?: { top: number; left: number }, fallbackIdx: number = 0) {
  if (explicitPos && typeof explicitPos.top === "number" && typeof explicitPos.left === "number") {
    return {
      top: `${explicitPos.top}%`,
      left: `${explicitPos.left}%`,
    };
  }

  if (typeof lat === "number" && typeof lng === "number") {
    // Coastal Kenya bounding box:
    // Latitude: -1.8° (North Garissa/Lamu) to -4.8° (South Coast Lunga Lunga)
    // Longitude: 38.0° (West Voi/Taita) to 40.4° (East Malindi Coast)
    const minLat = -4.8;
    const maxLat = -1.8;
    const minLng = 38.0;
    const maxLng = 40.4;

    const clampedLat = Math.min(Math.max(lat, minLat), maxLat);
    const clampedLng = Math.min(Math.max(lng, minLng), maxLng);

    // North is top (low top%), South is bottom (high top%)
    const topPct = ((maxLat - clampedLat) / (maxLat - minLat)) * 74 + 10;
    // West is left (low left%), East is right (high left%)
    const leftPct = ((clampedLng - minLng) / (maxLng - minLng)) * 58 + 16;

    return {
      top: `${Math.min(Math.max(Math.round(topPct), 8), 90)}%`,
      left: `${Math.min(Math.max(Math.round(leftPct), 10), 85)}%`,
    };
  }

  // Fallback
  return {
    top: `${25 + (fallbackIdx * 6) % 65}%`,
    left: `${30 + (fallbackIdx * 4) % 35}%`,
  };
}

export function EmbeddedCoastalMap({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onEditChapterLocation,
  className = "",
  allowToggleView = true,
  isAdmin = false,
}: EmbeddedCoastalMapProps) {
  const [mapMode, setMapMode] = useState<"interactive" | "satellite">("interactive");
  const [activePinId, setActivePinId] = useState<string>(
    selectedChapterId || (chapters[0]?.id ?? "")
  );

  const activePin = useMemo(() => {
    return chapters.find((c) => c.id === activePinId) || chapters[0] || null;
  }, [chapters, activePinId]);

  // Default coordinate center: Mombasa, Kenya (-4.0435, 39.6682)
  const defaultLat = -4.0435;
  const defaultLng = 39.6682;

  const currentLat = activePin?.coordinates?.lat ?? defaultLat;
  const currentLng = activePin?.coordinates?.lng ?? defaultLng;

  // OpenStreetMap embed URL centered on active pin
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.25}%2C${currentLat - 0.25}%2C${currentLng + 0.25}%2C${currentLat + 0.25}&layer=mapnik&marker=${currentLat}%2C${currentLng}`;

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white flex flex-col ${className}`}>
      {/* Map Header */}
      <div className="bg-navy-950 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-navy-800 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white leading-tight flex items-center gap-2">
              <span>Mombasa Coast Geographic Hub</span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold">
                  Admin Live Map
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">
              Live geographic deployment of {chapters.length} member chapters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allowToggleView && (
            <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setMapMode("interactive")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  mapMode === "interactive"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Interactive
              </button>
              <button
                type="button"
                onClick={() => setMapMode("satellite")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  mapMode === "satellite"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                OSM Live
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Display Body */}
      <div className="relative w-full h-[320px] sm:h-[400px] bg-slate-100 overflow-hidden">
        {mapMode === "satellite" ? (
          <iframe
            title="Mombasa Coastline OpenStreetMap"
            src={osmUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        ) : (
          /* High-Fidelity Interactive Styled Vector Coastal Map */
          <div className="relative w-full h-full bg-[#e8f4f8] overflow-hidden select-none">
            {/* Ocean Waves Pattern */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#082091_0.8px,transparent_0.8px)] [background-size:16px_16px]" />

            {/* Landmass Polygon (Representing Kenyan Coastline) */}
            <svg
              viewBox="0 0 400 360"
              className="absolute inset-0 w-full h-full preserve-3d"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eef6ed" />
                  <stop offset="100%" stopColor="#dcefd8" />
                </linearGradient>
                <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cdecf4" />
                  <stop offset="100%" stopColor="#9fd4e4" />
                </linearGradient>
                <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
                  <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#082091" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Ocean Base */}
              <rect width="400" height="360" fill="url(#oceanGrad)" />

              {/* Kenyan Mainland Coast Path */}
              <path
                d="M 0,0 L 260,0 C 230,60 210,120 180,180 C 150,240 120,300 90,360 L 0,360 Z"
                fill="url(#landGrad)"
                stroke="#b8dbb0"
                strokeWidth="2"
                filter="url(#shadow)"
              />

              {/* Mombasa Island Inset */}
              <path
                d="M 175,185 Q 190,175 195,190 Q 190,205 175,195 Z"
                fill="#f4faf0"
                stroke="#a6cca0"
                strokeWidth="1.5"
              />

              {/* Coastal Highway Route A14/B8 */}
              <path
                d="M 230,20 Q 185,120 160,210 Q 130,280 80,340"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
              <path
                d="M 230,20 Q 185,120 160,210 Q 130,280 80,340"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />

              {/* Water Labels */}
              <text x="280" y="80" fill="#082091" opacity="0.35" fontSize="12" fontWeight="bold" letterSpacing="2">
                INDIAN OCEAN
              </text>
              <text x="270" y="240" fill="#082091" opacity="0.25" fontSize="11" fontWeight="bold" letterSpacing="2">
                MOMBASA BASIN
              </text>
            </svg>

            {/* Geographical Markers pinned on Coastline */}
            <div className="absolute inset-0 pointer-events-auto">
              {chapters.map((ch, idx) => {
                const pos = calculateMapPosition(
                  ch.coordinates?.lat,
                  ch.coordinates?.lng,
                  ch.mapPosition,
                  idx
                );
                const isSelected = activePin?.id === ch.id;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActivePinId(ch.id);
                      if (onSelectChapter) onSelectChapter(ch);
                    }}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none transition-transform hover:scale-125"
                    title={`${ch.institutionName} (${ch.chapterName}) — ${ch.location}`}
                  >
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <span className="absolute -inset-2.5 rounded-full bg-amber-400/50 animate-ping" />
                      )}
                      <div
                        className={`w-7 h-7 rounded-full shadow-lg flex items-center justify-center border-2 transition-all ${
                          isSelected
                            ? "bg-amber-500 border-white text-navy-950 ring-2 ring-amber-400"
                            : "bg-navy-900 border-white text-white hover:bg-teal-600"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span
                        className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-all ${
                          isSelected
                            ? "bg-navy-950 text-amber-400 border border-amber-400/30"
                            : "bg-white text-slate-800 opacity-0 group-hover:opacity-100 border border-slate-200"
                        }`}
                      >
                        {ch.code}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Pin Info Card Overlay */}
            {activePin && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono font-bold text-[10px]">
                        {activePin.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {activePin.type}
                      </span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-navy-950 mt-1.5 line-clamp-1">
                      {activePin.institutionName}
                    </h5>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="line-clamp-1">{activePin.location}</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      GPS: {currentLat.toFixed(4)}° S, {currentLng.toFixed(4)}° E
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rally Quota</span>
                    <span className="font-heading font-black text-base text-teal-700">
                      {activePin.attendeesCount || 0}
                    </span>
                    {isAdmin && onEditChapterLocation && (
                      <button
                        type="button"
                        onClick={() => onEditChapterLocation(activePin)}
                        className="mt-2 px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-teal-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Edit Location</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Sub-footer showing quick GPS coordinates and live update indicator */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="font-mono font-medium">
            Active: {currentLat.toFixed(4)}° S, {currentLng.toFixed(4)}° E
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated live via Admin Portal</span>
          </span>
        </div>
      </div>
    </div>
  );
}
