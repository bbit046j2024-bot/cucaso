"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Upload, FileSpreadsheet, UserCheck, AlertTriangle, ShieldAlert } from "lucide-react";

export default function AttendeePortalPage() {
  const [attendees, setAttendees] = useState([
    {
      id: "att-1",
      fullName: "Emmanuel Mwangi",
      admission: "TUM/ENG/2023/001",
      gender: "MALE",
      ageCategory: "ADULT",
      emergencyPhone: "+254 711 111222",
      role: "DELEGATE",
      consentGiven: true,
      status: "CONFIRMED",
    },
    {
      id: "att-2",
      fullName: "Grace Achieng",
      admission: "MSSDA/2025/042",
      gender: "FEMALE",
      ageCategory: "UNDER_18",
      emergencyPhone: "+254 733 333444",
      role: "DELEGATE",
      guardianName: "Mary Achieng (Mother)",
      consentGiven: true,
      status: "CONFIRMED",
    },
    {
      id: "att-3",
      fullName: "Kevin Otieno",
      admission: "MSSDA/2025/088",
      gender: "MALE",
      ageCategory: "UNDER_18",
      emergencyPhone: "+254 722 555666",
      role: "DELEGATE",
      guardianName: "Unrecorded Guardian",
      consentGiven: false,
      status: "PENDING_CONSENT",
    },
  ]);

  const handleConsentUpdate = (id: string) => {
    setAttendees(
      attendees.map((att) =>
        att.id === id
          ? { ...att, consentGiven: true, status: "CONFIRMED", guardianName: "Verified Consent Recorded" }
          : att
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <Link
              href="/portal"
              className="text-xs font-bold uppercase tracking-wider text-teal-700 hover:underline mb-1 block"
            >
              ← Back to Portal Workspace
            </Link>
            <h1 className="font-heading font-extrabold text-3xl text-navy-900 flex items-center gap-2">
              <Upload className="w-8 h-8 text-amber-600" />
              Attendee Bulk Registration & Guardian Consent
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Upload chapter rosters, validate fields, and capture minor consent under the Kenya Data Protection Act 2019 (FR-ATT-01..05).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
              <FileSpreadsheet className="w-4 h-4" /> Download Excel Template
            </button>
          </div>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center mb-8 shadow-sm">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-base text-slate-900">
            Drag and drop your chapter roster spreadsheet (.xlsx, .csv)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            System automatically checks required fields, admission numbers, age categories, and cross-chapter duplicate entries before saving.
          </p>
          <label className="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs cursor-pointer inline-block">
            Select Spreadsheet File
            <input type="file" accept=".csv,.xlsx" className="hidden" />
          </label>
        </div>

        {/* Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Registered Attendee Roster (3 Entries)
            </h3>
            <span className="text-xs font-bold text-slate-500">Rally: Coastal Unity Rally 2026</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Admission / ID</th>
                <th className="py-3.5 px-4">Age Group</th>
                <th className="py-3.5 px-4">Guardian Consent (FR-ATT-04)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendees.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{att.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">{att.admission}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        att.ageCategory === "UNDER_18"
                          ? "bg-amber-100 text-amber-900 font-bold"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {att.ageCategory === "UNDER_18" ? "Under 18 (Minor)" : "Adult (18+)"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {att.ageCategory === "UNDER_18" ? (
                      att.consentGiven ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✓ {att.guardianName}
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4" /> Guardian Consent Required
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">N/A (Adult)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        att.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {att.status === "PENDING_CONSENT" ? (
                      <button
                        onClick={() => handleConsentUpdate(att.id)}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                      >
                        Record Guardian Consent
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Ready</span>
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
