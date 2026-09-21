"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Globe, 
  Compass, 
  Search, 
  Crosshair, 
  Building2, 
  Users, 
  Layers
} from "lucide-react";
import { Chapter } from "@/types";
import { COASTAL_AREA_PRESETS } from "@/lib/data";

interface EmbeddedCoastalMapProps {
  chapters: Chapter[];
  selectedChapterId?: string;
  onSelectChapter?: (chapter: Chapter) => void;
  onEditChapterLocation?: (chapter: Chapter) => void;
  className?: string;
  allowToggleView?: boolean;
  isAdmin?: boolean;
  fullBleed?: boolean;
}

// Map center points
const KENYA_CENTER: [number, number] = [0.0236, 37.9062];
const KENYA_ZOOM = 6;
const COASTAL_CENTER: [number, number] = [-3.5, 39.7];
const COASTAL_ZOOM = 8;
const MOMBASA_CENTER: [number, number] = [-4.05, 39.67];
const MOMBASA_ZOOM = 12;

// Helper: Resolve verified coordinates for any chapter
function resolveChapterCoords(ch: Chapter): [number, number] {
  if (ch.coordinates?.lat && ch.coordinates?.lng) {
    return [ch.coordinates.lat, ch.coordinates.lng];
  }
  // Try matching against coastal area presets
  const locLower = (ch.location || "").toLowerCase();
  const instLower = (ch.institutionName || "").toLowerCase();
  
  for (const preset of COASTAL_AREA_PRESETS) {
    const key = preset.name.toLowerCase().split(" ")[0];
    if (locLower.includes(key) || instLower.includes(key)) {
      return [preset.lat, preset.lng];
    }
  }

  // Fallback defaults by code
  if (ch.code?.includes("TUM")) return [-4.0326, 39.6642];
  if (ch.code?.includes("PWANI")) return [-3.6305, 39.8499];
  if (ch.code?.includes("KMTC")) return [-4.0585, 39.6740];
  if (ch.code?.includes("DIANI")) return [-4.2797, 39.5847];
  if (ch.code?.includes("TTU")) return [-3.3974, 38.5562];
  if (ch.code?.includes("MAL")) return [-3.2192, 40.1169];
  if (ch.code?.includes("KWL")) return [-4.1744, 39.4521];

  return [-4.0435, 39.6682]; // Mombasa central fallback
}

export function EmbeddedCoastalMap({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onEditChapterLocation,
  className = "",
  isAdmin = false,
  fullBleed = false,
}: EmbeddedCoastalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const leafletLibRef = useRef<typeof import("leaflet") | null>(null);

  const [activePinId, setActivePinId] = useState<string>(
    selectedChapterId || chapters[0]?.id || ""
  );
  const [activePin, setActivePin] = useState<Chapter | null>(
    chapters.find((c) => c.id === (selectedChapterId || chapters[0]?.id)) || chapters[0] || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mapPreset, setMapPreset] = useState<"coast" | "kenya" | "mombasa">("coast");

  // Keep active pin in sync if external selectedChapterId changes
  useEffect(() => {
    if (selectedChapterId) {
      setActivePinId(selectedChapterId);
      const found = chapters.find((c) => c.id === selectedChapterId);
      if (found) setActivePin(found);
    }
  }, [selectedChapterId, chapters]);

  // Filtered chapters for sidebar
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters.filter(
      (c) =>
        c.institutionName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }, [chapters, searchQuery]);

  // ── Helper to draw/redraw markers ───────────────────────────────────────────
  const renderMarkers = useCallback(
    (L: typeof import("leaflet"), map: import("leaflet").Map, currentActiveId: string) => {
      // Clear old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      chapters.forEach((ch) => {
        const [lat, lng] = resolveChapterCoords(ch);
        const isActive = ch.id === currentActiveId;

        // Custom HTML Icon
        const hasLogo = Boolean(ch.logoUrl);
        const iconHtml = `
          <div class="cucaso-map-pin ${isActive ? "active" : ""}" style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          ">
            <div style="
              width: ${isActive ? "38px" : "32px"};
              height: ${isActive ? "38px" : "32px"};
              border-radius: 50%;
              background: ${isActive ? "#0d9488" : "#0f172a"};
              border: 3px solid ${isActive ? "#fbbf24" : "#ffffff"};
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              box-shadow: ${
                isActive
                  ? "0 0 0 5px rgba(251, 191, 36, 0.4), 0 8px 16px rgba(0,0,0,0.4)"
                  : "0 2px 8px rgba(0,0,0,0.25)"
              };
              transition: transform 0.2s ease, width 0.2s ease, height 0.2s ease;
            ">
              ${
                hasLogo
                  ? `<img src="${ch.logoUrl}" alt="${ch.code}" style="width: 100%; height: 100%; object-fit: cover;" />`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? "18" : "15"}" height="${
                      isActive ? "18" : "15"
                    }" viewBox="0 0 24 24" fill="none" stroke="${
                      isActive ? "#ffffff" : "#2dd4bf"
                    }" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>`
              }
            </div>
            <div style="
              margin-top: 3px;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: -0.01em;
              background: ${isActive ? "#0f172a" : "#ffffff"};
              color: ${isActive ? "#fbbf24" : "#0f172a"};
              padding: 2px 6px;
              border-radius: 6px;
              border: 1px solid ${isActive ? "#fbbf24" : "#cbd5e1"};
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            ">
              ${ch.code}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: "cucaso-custom-pin-wrapper",
          html: iconHtml,
          iconSize: [46, 56],
          iconAnchor: [23, 34],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([lat, lng], { icon });

        // Popup HTML with logo and chapter credentials
        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              ${
                ch.logoUrl
                  ? `<img src="${ch.logoUrl}" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;" />`
                  : `<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #ccfbf1; color: #0f766e; font-size: 10px; font-weight: 800;">${ch.code}</span>`
              }
              <div>
                <span style="font-size: 10px; font-weight: 700; color: #0d9488; text-transform: uppercase;">${ch.type} · ${ch.sector}</span>
              </div>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">${ch.institutionName}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">
              📍 ${ch.location}
            </p>
            <div style="display: flex; items-center; justify-content: space-between; font-size: 10px; color: #475569; background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid #f1f5f9; margin-bottom: 6px;">
              <span>👥 Delegates</span>
              <strong style="color: #0f766e; font-size: 12px;">${ch.attendeesCount || 0}</strong>
            </div>
            <div style="font-size: 9px; font-family: monospace; color: #94a3b8; text-align: right;">
              ${lat.toFixed(4)}°, ${lng.toFixed(4)}°
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 280, className: "cucaso-leaflet-popup" });

        marker.on("click", () => {
          setActivePinId(ch.id);
          setActivePin(ch);
          if (onSelectChapter) onSelectChapter(ch);
        });

        marker.addTo(map);
        markersRef.current.set(ch.id, marker);
      });
    },
    [chapters, onSelectChapter]
  );

  // ── Initialise Leaflet map once ──────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletLibRef.current = L;

      // Guard: If container was already initialized by leaflet (e.g. StrictMode or Fast Refresh), reset it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const containerEl = mapContainerRef.current as any;
      if (containerEl._leaflet_id) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        delete containerEl._leaflet_id;
      }

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: COASTAL_CENTER,
        zoom: COASTAL_ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      // Live OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      mapInstanceRef.current = map;

      // Render pins
      renderMarkers(L, map, activePinId);

      // Invalidate size to guarantee tiles fit container without glitches
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    });

    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update markers when chapters change ──────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLibRef.current) return;
    renderMarkers(leafletLibRef.current, mapInstanceRef.current, activePinId);
  }, [chapters, renderMarkers, activePinId]);

  // ── Fly to chapter when selected ─────────────────────────────────────────
  const flyToChapter = useCallback(
    (ch: Chapter) => {
      setActivePinId(ch.id);
      setActivePin(ch);
      if (onSelectChapter) onSelectChapter(ch);

      const [lat, lng] = resolveChapterCoords(ch);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
        // Open the marker's popup
        const marker = markersRef.current.get(ch.id);
        if (marker) {
          marker.openPopup();
        }
      }
    },
    [onSelectChapter]
  );

  // Set preset view (Coast / Whole Kenya / Mombasa)
  const applyPresetView = (preset: "coast" | "kenya" | "mombasa") => {
    setMapPreset(preset);
    if (!mapInstanceRef.current) return;

    if (preset === "kenya") {
      mapInstanceRef.current.flyTo(KENYA_CENTER, KENYA_ZOOM, { duration: 1 });
    } else if (preset === "coast") {
      mapInstanceRef.current.flyTo(COASTAL_CENTER, COASTAL_ZOOM, { duration: 1 });
    } else if (preset === "mombasa") {
      mapInstanceRef.current.flyTo(MOMBASA_CENTER, MOMBASA_ZOOM, { duration: 1 });
    }
  };

  const currentCoords = activePin ? resolveChapterCoords(activePin) : COASTAL_CENTER;

  const wrapperCls = fullBleed
    ? `relative w-full overflow-hidden bg-slate-900 border-0 ${className}`
    : `relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 ${className}`;

  return (
    <div className={wrapperCls}>
      {/* ── Top Bar Controls ──────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-navy-950/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-sm text-white tracking-tight">
                Live OpenStreetMap Chapters
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Live Pins
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Admin Edit Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {chapters.length} institutions mapped • Real-time GPS markers
            </p>
          </div>
        </div>

        {/* View Preset Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => applyPresetView("kenya")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                mapPreset === "kenya"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Whole Kenya
            </button>
            <button
              type="button"
              onClick={() => applyPresetView("coast")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                mapPreset === "coast"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Coastal Region
            </button>
            <button
              type="button"
              onClick={() => applyPresetView("mombasa")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                mapPreset === "mombasa"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Mombasa Island
            </button>
          </div>

          <a
            href={`https://www.openstreetmap.org/?mlat=${currentCoords[0]}&mlon=${currentCoords[1]}#map=13/${currentCoords[0]}/${currentCoords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all border border-white/10"
            title="Open in OpenStreetMap external site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OSM Full</span>
          </a>
        </div>
      </div>

      {/* ── Main Map Canvas Container ──────────────────────────────────────── */}
      <div
        className="relative w-full"
        style={{
          minHeight: fullBleed ? "600px" : "540px",
          height: fullBleed ? "clamp(600px, 75vh, 850px)" : "clamp(540px, 65vh, 720px)",
        }}
      >
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* ── Chapter Directory Floating Sidebar (Overlays Top-Right) ────────── */}
        <div className="absolute top-4 right-4 z-20 w-64 sm:w-72 max-h-[calc(100%-32px)] flex flex-col bg-navy-950/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl overflow-hidden pointer-events-auto">
          {/* Sidebar Header & Search */}
          <div className="p-3 border-b border-white/10 bg-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold uppercase tracking-wider">
              <span>Chapter Directory</span>
              <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {filteredChapters.length}
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus or county..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-900/80 border border-white/15 text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Chapters Scrollable List */}
          <div className="overflow-y-auto divide-y divide-white/5 p-1 flex-1">
            {filteredChapters.map((ch) => {
              const isActive = activePinId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => flyToChapter(ch)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 ${
                    isActive
                      ? "bg-teal-700/60 text-white shadow-inner"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {/* Logo or Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border ${
                      isActive
                        ? "bg-amber-400 text-navy-950 border-amber-300"
                        : "bg-navy-900 text-teal-400 border-white/10"
                    }`}
                  >
                    {ch.logoUrl ? (
                      <img
                        src={ch.logoUrl}
                        alt={ch.code}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold leading-tight truncate">
                        {ch.institutionName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="font-mono text-teal-300 font-semibold">{ch.code}</span>
                      <span>•</span>
                      <span className="truncate">{ch.location}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredChapters.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching chapters found
              </div>
            )}
          </div>
        </div>

        {/* ── Active Chapter Detail Card (Bottom-Left) ───────────────────────── */}
        {activePin && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm sm:max-w-md w-[calc(100%-32px)] sm:w-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-start gap-3">
              {/* Institution Logo */}
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {activePin.logoUrl ? (
                  <img
                    src={activePin.logoUrl}
                    alt={activePin.code}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-teal-700" />
                )}
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-extrabold text-[10px]">
                    {activePin.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {activePin.type}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {activePin.sector}
                  </span>
                </div>

                <h5 className="font-heading font-black text-sm text-navy-950 leading-snug line-clamp-1">
                  {activePin.institutionName}
                </h5>

                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{activePin.location}</span>
                </p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      <strong className="text-teal-700 font-bold">
                        {activePin.attendeesCount || 0}
                      </strong>{" "}
                      delegates
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${currentCoords[0]},${currentCoords[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    {isAdmin && onEditChapterLocation && (
                      <button
                        type="button"
                        onClick={() => onEditChapterLocation(activePin)}
                        className="px-2 py-1 rounded bg-navy-900 hover:bg-navy-800 text-white font-bold text-[10px] transition-colors"
                      >
                        Edit GPS
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Status Footer ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-2.5 bg-navy-950/95 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 animate-pulse" />
          <span className="font-mono text-slate-300">
            {activePin
              ? `${activePin.institutionName} (${currentCoords[0].toFixed(4)}° S, ${currentCoords[1].toFixed(4)}° E)`
              : "Live OpenStreetMap Engine"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OpenStreetMap Tiles Live</span>
          </span>
          <span className="text-[10px] text-slate-500">
            Data © OpenStreetMap contributors
          </span>
        </div>
      </div>
    </div>
  );
}
