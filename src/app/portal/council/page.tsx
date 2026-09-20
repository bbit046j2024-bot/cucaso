"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Check, X, MessageSquare } from "lucide-react";

export default function CouncilPortalPage() {
  const [applications, setApplications] = useState([
    {
      id: "app-1",
      institutionName: "Technical University of Mombasa",
      chapterName: "TUM SDA Chapter",
      type: "UNIVERSITY",
      sector: "PUBLIC",
      location: "Tudor, Mombasa",
      patronName: "Pr. Eric M.",
      patronPhone: "+254 712 345678",
      patronEmail: "patron@tum.ac.ke",
      approxMembers: 150,
      status: "UNDER_REVIEW",
      endorsementUrl: "endorsement_tum.pdf",
      assignedTier: "Tier 1",
    },
    {
      id: "app-2",
      institutionName: "Coast Secondary School",
      chapterName: "Coast Secondary SDA Chapter",
      type: "SECONDARY",
      sector: "PUBLIC",
      location: "Mvita, Mombasa",
      patronName: "Mr. Samuel O.",
      patronPhone: "+254 722 987654",
      patronEmail: "patron@coastsec.sc.ke",
      approxMembers: 50,
      status: "SUBMITTED",
      endorsementUrl: "endorsement_coastsec.pdf",
      assignedTier: "Tier 4",
    },
  ]);

  const handleDecision = (id: string, newStatus: string) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
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
              Council Review Queue & Tier Assignment
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Administration Council portal for reviewing institutional onboarding applications (FR-ONB-03/04/05).
            </p>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                <th className="py-3.5 px-4">Institution / Chapter</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Patron Contact</th>
                <th className="py-3.5 px-4">Endorsement</th>
                <th className="py-3.5 px-4">Assigned Tier (FR-ONB-05)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Council Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{app.institutionName}</span>
                    <span className="text-xs text-slate-500">{app.chapterName} · {app.location}</span>
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
                    <a
                      href="#"
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      📄 {app.endorsementUrl}
                    </a>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={app.assignedTier}
                      onChange={(e) => {
                        const updated = applications.map((a) =>
                          a.id === app.id ? { ...a, assignedTier: e.target.value } : a
                        );
                        setApplications(updated);
                      }}
                      className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800"
                    >
                      <option value="Tier 1">Tier 1 (Weight 2.0x)</option>
                      <option value="Tier 2">Tier 2 (Weight 1.5x)</option>
                      <option value="Tier 3">Tier 3 (Weight 1.0x)</option>
                      <option value="Tier 4">Tier 4 (Weight 0.5x)</option>
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
                          onClick={() => handleDecision(app.id, "APPROVED")}
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
                      <span className="text-xs text-slate-400 font-semibold">Decided & Code Generated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
