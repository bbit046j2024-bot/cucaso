"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Upload,
  FileSpreadsheet,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

interface AttendeeItem {
  id: string;
  fullName: string;
  admissionOrIdNumber: string;
  gender: "MALE" | "FEMALE";
  ageCategory: "UNDER_18" | "ADULT";
  emergencyPhone?: string;
  role: "DELEGATE" | "OFFICIAL" | "PATRON" | "VOLUNTEER" | "SPEAKER" | "GUEST";
  status: "REGISTERED" | "CONFIRMED" | "CHECKED_IN" | "PENDING_CONSENT" | "FLAGGED_DUPLICATE";
  guardianConsent?: {
    id: string;
    guardianName: string;
    guardianPhone: string;
    relationship: string;
    consentGiven: boolean;
  } | null;
  chapter?: {
    name: string;
    code: string;
  };
}

export default function AttendeePortalPage() {
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAge, setFilterAge] = useState<"ALL" | "UNDER_18" | "ADULT">("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [consentModalItem, setConsentModalItem] = useState<AttendeeItem | null>(null);
  const [consentForm, setConsentForm] = useState({
    guardianName: "",
    guardianPhone: "",
    relationship: "PARENT",
  });
  const [consentLoading, setConsentLoading] = useState(false);

  // New Attendee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    admissionOrIdNumber: "",
    gender: "MALE" as "MALE" | "FEMALE",
    ageCategory: "ADULT" as "ADULT" | "UNDER_18",
    emergencyPhone: "",
    role: "DELEGATE" as any,
    guardianName: "",
    guardianPhone: "",
    relationship: "PARENT",
  });
  const [addLoading, setAddLoading] = useState(false);

  // CSV Upload State
  const [uploading, setUploading] = useState(false);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendees");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAttendees(json.data);
      } else {
        showToast("error", json.error || "Failed to load attendees");
      }
    } catch {
      showToast("error", "Network error fetching attendees roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentModalItem) return;
    if (!consentForm.guardianName.trim() || !consentForm.guardianPhone.trim()) {
      showToast("error", "Guardian name and phone number are required.");
      return;
    }

    setConsentLoading(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: consentModalItem.id,
          guardianName: consentForm.guardianName.trim(),
          guardianPhone: consentForm.guardianPhone.trim(),
          relationship: consentForm.relationship,
          consentGiven: true,
          status: "CONFIRMED",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("success", `Guardian consent recorded for ${consentModalItem.fullName}`);
        setConsentModalItem(null);
        setConsentForm({ guardianName: "", guardianPhone: "", relationship: "PARENT" });
        fetchAttendees();
      } else {
        showToast("error", json.error || "Failed to save consent");
      }
    } catch {
      showToast("error", "Network error recording consent");
    } finally {
      setConsentLoading(false);
    }
  };

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.admissionOrIdNumber.trim()) {
      showToast("error", "Full name and admission/ID number are required.");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const json = await res.json();
      if (json.success) {
        showToast("success", `Registered ${addForm.fullName} successfully!`);
        setShowAddModal(false);
        setAddForm({
          fullName: "",
          admissionOrIdNumber: "",
          gender: "MALE",
          ageCategory: "ADULT",
          emergencyPhone: "",
          role: "DELEGATE",
          guardianName: "",
          guardianPhone: "",
          relationship: "PARENT",
        });
        fetchAttendees();
      } else {
        showToast("error", json.error || "Failed to register attendee");
      }
    } catch {
      showToast("error", "Network error creating attendee");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteAttendee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this roster?`)) return;

    try {
      const res = await fetch(`/api/attendees?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Removed ${name} from roster.`);
        setAttendees(prev => prev.filter(a => a.id !== id));
      } else {
        showToast("error", json.error || "Failed to delete attendee");
      }
    } catch {
      showToast("error", "Network error removing attendee");
    }
  };

  // CSV parsing and batch upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        showToast("error", "File is empty or contains no header row.");
        setUploading(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes("name"));
      const idIdx = headers.findIndex(h => h.includes("admission") || h.includes("id"));
      const genderIdx = headers.findIndex(h => h.includes("gender"));
      const ageIdx = headers.findIndex(h => h.includes("age"));
      const phoneIdx = headers.findIndex(h => h.includes("phone"));
      const roleIdx = headers.findIndex(h => h.includes("role"));

      if (nameIdx === -1 || idIdx === -1) {
        showToast("error", "CSV must contain columns for 'Full Name' and 'Admission Number'.");
        setUploading(false);
        return;
      }

      let createdCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
        if (!cols[nameIdx] || !cols[idIdx]) continue;

        const rawAge = ageIdx !== -1 ? cols[ageIdx]?.toUpperCase() : "ADULT";
        const isMinor = rawAge.includes("UNDER") || rawAge.includes("MINOR") || rawAge === "<18";

        const attendeePayload = {
          fullName: cols[nameIdx],
          admissionOrIdNumber: cols[idIdx],
          gender: genderIdx !== -1 && cols[genderIdx]?.toUpperCase().startsWith("F") ? "FEMALE" : "MALE",
          ageCategory: isMinor ? "UNDER_18" : "ADULT",
          emergencyPhone: phoneIdx !== -1 ? cols[phoneIdx] : undefined,
          role: roleIdx !== -1 && cols[roleIdx] ? cols[roleIdx].toUpperCase() : "DELEGATE",
        };

        try {
          const res = await fetch("/api/attendees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendeePayload),
          });
          const resJson = await res.json();
          if (resJson.success) createdCount++;
          else errorCount++;
        } catch {
          errorCount++;
        }
      }

      showToast("success", `Processed CSV: ${createdCount} registered, ${errorCount} skipped or duplicated.`);
      fetchAttendees();
    } catch {
      showToast("error", "Failed to parse CSV spreadsheet.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = "Full Name,Admission or ID Number,Gender,Age Group (ADULT or UNDER_18),Emergency Phone,Role\n" +
      "John Doe,TUM/ENG/2024/001,MALE,ADULT,+254712345678,DELEGATE\n" +
      "Jane Smith,MSSDA/2025/012,FEMALE,UNDER_18,+254798765432,DELEGATE\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "CUCASO_Attendee_Roster_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered attendees
  const filteredAttendees = attendees.filter(att => {
    const matchesSearch =
      (att.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.admissionOrIdNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.emergencyPhone || "").includes(searchQuery);

    const matchesAge = filterAge === "ALL" || att.ageCategory === filterAge;
    const matchesStatus = filterStatus === "ALL" || att.status === filterStatus;

    return matchesSearch && matchesAge && matchesStatus;
  });

  const minorsCount = attendees.filter(a => a.ageCategory === "UNDER_18").length;
  const minorsPendingConsent = attendees.filter(
    a => a.ageCategory === "UNDER_18" && (!a.guardianConsent || !a.guardianConsent.consentGiven)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

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

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadCsvTemplate}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download CSV Template
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Single Attendee
            </button>
            <button
              onClick={fetchAttendees}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Total Registered</span>
              <span className="text-2xl font-black text-navy-900 block mt-1">{attendees.length}</span>
            </div>
            <UserCheck className="w-8 h-8 text-teal-600" />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Minors (Under 18)</span>
              <span className="text-2xl font-black text-amber-600 block mt-1">{minorsCount}</span>
            </div>
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Pending KDPA Consent</span>
              <span className={`text-2xl font-black block mt-1 ${minorsPendingConsent > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {minorsPendingConsent}
              </span>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center mb-8 shadow-sm">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-base text-slate-900">
            Drag and drop your chapter roster spreadsheet (.csv)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            System automatically validates required fields, admission numbers, age categories, and prevents duplicate entries before saving to TiDB Cloud.
          </p>
          <label className="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs cursor-pointer inline-block transition-colors">
            {uploading ? "Processing CSV Roster…" : "Select CSV Spreadsheet File"}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Roster Controls: Search & Filters */}
        <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, admission ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">All Age Groups</option>
              <option value="UNDER_18">Minors (&lt; 18)</option>
              <option value="ADULT">Adults (18+)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REGISTERED">Registered</option>
              <option value="CHECKED_IN">Checked In</option>
            </select>
          </div>
        </div>

        {/* Roster Table */}
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-700" />
              <p className="text-xs font-bold">Loading attendee roster from database…</p>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No attendees found</p>
              <p className="text-xs text-slate-500 mt-1">Upload a CSV roster or click &ldquo;Add Single Attendee&rdquo; to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Admission / ID</th>
                    <th className="py-3.5 px-4">Age Group</th>
                    <th className="py-3.5 px-4">KDPA Guardian Consent</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAttendees.map((att) => {
                    const isMinor = att.ageCategory === "UNDER_18";
                    const hasConsent = isMinor && att.guardianConsent?.consentGiven;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {att.fullName}
                          {att.emergencyPhone && (
                            <span className="block text-[11px] font-normal text-slate-500 font-mono">
                              {att.emergencyPhone}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                          {att.admissionOrIdNumber}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              isMinor
                                ? "bg-amber-100 text-amber-900 font-bold"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isMinor ? "Under 18 (Minor)" : "Adult (18+)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {isMinor ? (
                            hasConsent ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {att.guardianConsent?.guardianName} ({att.guardianConsent?.guardianPhone})
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> Guardian Consent Required
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">N/A (Adult)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              att.status === "CONFIRMED" || att.status === "CHECKED_IN"
                                ? "bg-emerald-100 text-emerald-800"
                                : !hasConsent && isMinor
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isMinor && !hasConsent && (
                              <button
                                onClick={() => {
                                  setConsentModalItem(att);
                                  setConsentForm({
                                    guardianName: att.guardianConsent?.guardianName || "",
                                    guardianPhone: att.guardianConsent?.guardianPhone || "",
                                    relationship: att.guardianConsent?.relationship || "PARENT",
                                  });
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
                              >
                                Record Consent
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAttendee(att.id, att.fullName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Attendee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Record Guardian Consent */}
      {consentModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Record Guardian Consent
              </h3>
              <button
                onClick={() => setConsentModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Under KDPA 2019 (Section 33), processing personal data of minors (&lt;18) requires verified parental/guardian consent.
            </p>

            <form onSubmit={handleConsentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Minor / Attendee
                </label>
                <input
                  type="text"
                  disabled
                  value={`${consentModalItem.fullName} (${consentModalItem.admissionOrIdNumber})`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Parent / Guardian Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mary Achieng"
                  value={consentForm.guardianName}
                  onChange={(e) => setConsentForm({ ...consentForm, guardianName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Guardian Emergency Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +254 712 345 678"
                  value={consentForm.guardianPhone}
                  onChange={(e) => setConsentForm({ ...consentForm, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Relationship to Minor
                </label>
                <select
                  value={consentForm.relationship}
                  onChange={(e) => setConsentForm({ ...consentForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
                >
                  <option value="PARENT">Parent (Father / Mother)</option>
                  <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                  <option value="SCHOOL_PATRON">Designated School Patron / Principal</option>
                  <option value="OTHER">Other Authorized Representative</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setConsentModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={consentLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {consentLoading ? "Recording…" : "Save Consent & Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Single Attendee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-navy-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-700" />
                Register New Attendee
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAttendee} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Karanja"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TUM/ENG/2024/099"
                    value={addForm.admissionOrIdNumber}
                    onChange={(e) => setAddForm({ ...addForm, admissionOrIdNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +254 700 000 000"
                    value={addForm.emergencyPhone}
                    onChange={(e) => setAddForm({ ...addForm, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Age Category</label>
                  <select
                    value={addForm.ageCategory}
                    onChange={(e) => setAddForm({ ...addForm, ageCategory: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
                  >
                    <option value="ADULT">Adult (18+)</option>
                    <option value="UNDER_18">Minor (Under 18)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {addLoading ? "Saving…" : "Save Attendee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
