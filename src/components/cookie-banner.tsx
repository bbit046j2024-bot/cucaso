"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, ShieldCheck, Settings2, Check, X, SlidersHorizontal, Info } from "lucide-react";

const CONSENT_STORAGE_KEY = "cucaso_cookie_consent_v1";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    timestamp: "",
  });

  // Check consent status on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        setHasConsented(true);
        setShowBanner(false);
      } else {
        // First-time visitor: reveal banner with a gentle delay
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    try {
      const record = { ...updated, timestamp: new Date().toISOString() };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
      setPreferences(record);
      setHasConsented(true);
      setShowBanner(false);
      setShowModal(false);

      // Notify any listening analytics or UI scripts
      window.dispatchEvent(
        new CustomEvent("cucaso:cookie-consent-updated", { detail: record })
      );
    } catch (err) {
      console.warn("Could not save cookie preferences", err);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      timestamp: "",
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      timestamp: "",
    });
  };

  const handleSaveCustomPreferences = () => {
    saveConsent(preferences);
  };

  // Prevent rendering before hydration to avoid SSR mismatch, and hide inside the /portal dashboard
  if (!mounted || isPortal) return null;

  return (
    <>
      {/* ── Persistent Floating Trigger / Indicator (Bottom-Left) ── */}
      {hasConsented && !showBanner && !showModal && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          title="Cookie & Privacy Preferences"
          aria-label="Manage Cookie & Privacy Preferences"
          className="fixed bottom-20 md:bottom-6 left-4 z-40 group flex items-center gap-2 px-3 py-2 md:px-3.5 md:py-2.5 rounded-full bg-white/95 hover:bg-white text-navy-950 border border-slate-200/80 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Cookie className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-navy-950 transition-colors hidden sm:inline">
            Cookie Settings
          </span>
        </button>
      )}

      {/* ── Interactive First-Time Banner (Bottom Floating Card) ── */}
      {showBanner && !showModal && (
        <aside
          role="dialog"
          aria-label="Cookie & Privacy Consent"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-2xl shadow-navy-950/15 text-slate-900">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-black text-sm md:text-base text-navy-950 flex items-center gap-2">
                    Cookie &amp; Privacy Preferences
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowBanner(false)}
                    aria-label="Dismiss banner"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We use strictly necessary cookies to keep your account login secure, along with optional
                  functional and analytical cookies to improve fellowship rally coordination and platform performance.
                  Learn more in our{" "}
                  <Link
                    href="/privacy"
                    className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Banner Buttons */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:shadow-lg"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Granular Preferences Center Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="font-heading font-black text-lg text-navy-950">
                    Cookie Preferences
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage how cookies are utilized across your session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              In compliance with the Kenya Data Protection Act 2019 and global privacy standards, you have the
              right to decide which cookies are stored on your device. Essential cookies are required to authenticate
              chapter representatives and administrators.
            </p>

            {/* Category Cards */}
            <div className="space-y-3">
              {/* Category 1: Strictly Necessary (Always On) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-navy-950">Strictly Necessary</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Always Active
                    </span>
                  </div>
                  <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 opacity-90 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Required for secure authentication (<code className="text-slate-700 bg-white px-1 py-0.5 rounded text-[10px]">cucaso_session</code>),
                  CSRF protection, role verification, and core security functions.
                </p>
              </div>

              {/* Category 2: Functional & Customization */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-xs text-navy-950">Functional &amp; Experience</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.functional}
                    onClick={() =>
                      setPreferences(prev => ({ ...prev, functional: !prev.functional }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      preferences.functional ? "bg-teal-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        preferences.functional ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Remembers your portal preferences, chosen chapter filters, interactive rally calendar views, and dismissed notifications.
                </p>
              </div>

              {/* Category 3: Analytics & Performance */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-xs text-navy-950">Analytics &amp; Performance</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.analytics}
                    onClick={() =>
                      setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      preferences.analytics ? "bg-teal-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        preferences.analytics ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Helps the CUCASO secretariat understand page popularity, device compatibility, and download speeds via anonymous usage statistics.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <Link
                href="/privacy"
                onClick={() => setShowModal(false)}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Read Full Privacy Notice</span>
              </Link>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleSaveCustomPreferences}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all hover:shadow-lg"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
