"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { normalizeGoogleImageUrl } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Sparkles,
  MapPin,
  UserX,
} from "lucide-react";

// ── Helper: Avatar with image + initials fallback ─────────────────────────────
function LeaderAvatar({
  name,
  imageUrl,
  size = "lg",
  className = "",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "lg" | "sm";
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const normalizedUrl = imageUrl ? normalizeGoogleImageUrl(imageUrl) : null;
  const showImg = normalizedUrl && !imgFailed;

  if (size === "lg") {
    return (
      <div
        className={`relative rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-navy-900 to-amber-700 flex items-center justify-center flex-shrink-0 w-36 h-36 ${className}`}
      >
        <span className="font-heading font-black text-3xl text-white select-none">
          {initials}
        </span>
        {showImg && (
          <img
            src={normalizedUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy-900 to-amber-700 text-white font-heading font-black text-xl flex items-center justify-center flex-shrink-0 w-16 h-16 border-2 border-slate-100 shadow-sm ${className}`}
    >
      <span className="select-none">{initials}</span>
      {showImg && (
        <img
          src={normalizedUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

export default function LeadershipPage() {
  const [activeTab, setActiveTab] = useState<"council" | "other">("council");
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leadership")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setLeaders(json.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch leaders:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const centralCouncilLeaders = leaders.filter(
    (l) => (l.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL"
  );
  const otherLeaders = leaders.filter((l) => l.category === "OTHER");

  // Top 3 from Central Council (or first 3 overall)
  const top3 = (centralCouncilLeaders.length > 0 ? centralCouncilLeaders : leaders).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <section className="bg-navy-950 text-white py-14 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-3">
              Our Council &amp; Leadership
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Committed to transparent stewardship, spiritual mentorship, and equitable representation for all Seventh-day Adventist institutions across the Kenyan coast.
            </p>
          </div>
        </section>

        {/* ── Top 3 Executive Leaders ────────────────────────────────────── */}
        <section className="py-14 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mt-2">
                Executive Leadership
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 animate-pulse flex flex-col items-center">
                    <div className="w-36 h-36 rounded-full bg-slate-200 mb-5" />
                    <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                    <div className="h-6 w-40 bg-slate-200 rounded mb-3" />
                    <div className="h-3 w-48 bg-slate-200 rounded mb-4" />
                    <div className="h-12 w-full bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : top3.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {top3.map((leader, i) => (
                  <div
                    key={leader.id || i}
                    className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center group"
                  >
                    <LeaderAvatar
                      name={leader.name}
                      imageUrl={leader.imageUrl || leader.image}
                      size="lg"
                      className="mb-5 group-hover:[&>img]:scale-105 [&>img]:transition-transform [&>img]:duration-300"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                      {leader.title || leader.role || "Council Officer"}
                    </span>
                    <h3 className="font-heading font-black text-xl text-navy-950 mb-1">
                      {leader.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-4">
                      {leader.institution || "CUCASO Central Council"}
                    </p>
                    {leader.bio && (
                      <p className="text-xs text-slate-600 leading-relaxed font-body">
                        {leader.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                <UserX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">Leadership directory is being updated.</p>
                <p className="text-xs text-slate-400 mt-1">Check back shortly or contact the council secretariat.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Tab Navigation ─────────────────────────────────────────────── */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => setActiveTab("council")}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "council"
                  ? "bg-navy-900 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Executive Council ({centralCouncilLeaders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("other")}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "other"
                  ? "bg-navy-900 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Regional, Patrons &amp; Others ({otherLeaders.length})</span>
              </button>
            </div>

            {/* TAB 1: Central Council */}
            {activeTab === "council" ? (
              loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse">
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-3 w-20 bg-slate-200 rounded" />
                          <div className="h-5 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-28 bg-slate-200 rounded" />
                        </div>
                      </div>
                      <div className="h-16 bg-slate-100 rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-3 w-36 bg-slate-200 rounded" />
                        <div className="h-3 w-40 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : centralCouncilLeaders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                  {centralCouncilLeaders.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          <LeaderAvatar
                            name={member.name}
                            imageUrl={member.imageUrl || member.image}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider block w-fit mb-1">
                              {member.title}
                            </span>
                            <h4 className="font-heading font-black text-lg text-navy-950 truncate">
                              {member.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {member.institution || "CUCASO Central Council"}
                            </p>
                          </div>
                        </div>

                        {member.bio && (
                          <p className="text-xs text-slate-600 leading-relaxed py-3 border-t border-b border-slate-100 mb-4 font-body line-clamp-4">
                            {member.bio}
                          </p>
                        )}

                        <div className="space-y-1 text-xs text-slate-500 mb-4">
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-amber-600" />
                              <span>{member.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-700">Accredited Council Officer</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-navy-900 bg-navy-50 px-2 py-0.5 rounded">
                          Central Council
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Executive Council directory is being updated.</p>
                  <p className="text-xs text-slate-400 mt-1">Profiles will appear here once added by the council secretariat.</p>
                </div>
              )
            ) : (
              /* TAB 2: Regional / Other */
              loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-48" />
                  ))}
                </div>
              ) : otherLeaders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                  {otherLeaders.map((ldr) => (
                    <div
                      key={ldr.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-3">
                          <LeaderAvatar
                            name={ldr.name}
                            imageUrl={ldr.imageUrl || ldr.image}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                              {ldr.title}
                            </span>
                            <h4 className="font-heading font-black text-lg text-navy-950 truncate">
                              {ldr.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{ldr.institution}</p>
                          </div>
                        </div>
                        {ldr.bio && (
                          <p className="text-xs text-slate-600 leading-relaxed font-body py-2 border-t border-slate-100 mb-3 line-clamp-3">
                            {ldr.bio}
                          </p>
                        )}
                        {ldr.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                            <span>{ldr.phone}</span>
                          </div>
                        )}
                        {ldr.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                            <span>{ldr.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-4">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>Regional / Advisory Representative</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No regional or advisory profiles yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Regional heads and patrons will appear here once added.</p>
                </div>
              )
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
