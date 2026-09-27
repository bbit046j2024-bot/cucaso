"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Check, X, RefreshCw, Loader2 } from "lucide-react";

export default function CouncilPortalPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications from API on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, newStatus: string, assignedTier?: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, assignedTier }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (err) {
      console.error("Decision update failed:", err);
      // Optimistic update fallback
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    }
  };

  const handleTierChange = (id: string, tier: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, assignedTier: tier } : a))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <Link
              href="/portal"
              className="text-xs font-bold uppercase tracking-wider text-teal-700 hover:underline mb-1 block"
            >
              ← Back to Portal Workspace
            </Link>
            <h1 className="font-heading font-extrabold text-3xl text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-teal-600" />
              Council Review Queue &amp; Tier Assignment
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Administration Council portal for reviewing institutional onboarding applications.
            </p>
          </div>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
              <p className="text-sm text-slate-500">Loading applications from database…</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-slate-700">No Pending Applications</h3>
            <p className="text-sm text-slate-500 mt-1">
              All chapter applications have been reviewed, or none have been submitted yet.
            </p>
          </div>
        ) : (
          /* Queue Table */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                  <th className="py-3.5 px-4">Institution / Chapter</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Patron Contact</th>
                  <th className="py-3.5 px-4">Endorsement</th>
                  <th className="py-3.5 px-4">Assigned Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Council Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{app.institutionName}</span>
                      <span className="text-xs text-slate-500">
                        {app.chapterName} · {app.location}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs">
                        {app.type} ({app.sector})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-700">
                      <span className="font-bold block">{app.patronName}</span>
                      <span className="text-slate-500">{app.patronPhone}</span>
                    </td>
                    <td className="py-4 px-4">
                      {app.endorsementUrl ? (
                        <a
                          href={app.endorsementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                        >
                          📄 View Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={app.assignedTier || "TIER_3"}
                        onChange={(e) => handleTierChange(app.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800"
                      >
                        <option value="TIER_1">Tier 1 (Weight 2.0×)</option>
                        <option value="TIER_2">Tier 2 (Weight 1.5×)</option>
                        <option value="TIER_3">Tier 3 (Weight 1.0×)</option>
                        <option value="TIER_4">Tier 4 (Weight 0.5×)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          app.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {app.status !== "APPROVED" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDecision(app.id, "APPROVED", app.assignedTier)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, "REJECTED")}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Decided &amp; Code Generated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
