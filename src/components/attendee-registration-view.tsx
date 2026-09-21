"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CURRENT_RALLY, MEMBER_CHAPTERS } from "@/lib/data";
import { Chapter, Attendee } from "@/types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  ExternalLink,
  ChevronRight,
  Building2,
  IdCard,
  UserCheck,
  Check,
  Phone,
  Mail,
  QrCode,
  FileCheck,
} from "lucide-react";

interface AttendeeRegistrationViewProps {
  chapterCode?: string;
}

export function AttendeeRegistrationView({ chapterCode }: AttendeeRegistrationViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>(MEMBER_CHAPTERS);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [checkingId, setCheckingId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    performed: boolean;
    exists: boolean;
    registeredByAdmin?: boolean;
    attendee?: Attendee;
    message?: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    admissionOrIdNumber: "",
    phone: "",
    gender: "MALE" as "MALE" | "FEMALE",
    ageCategory: "ADULT" as "ADULT" | "UNDER_18",
    department: "",
    role: "DELEGATE" as "DELEGATE" | "LEADER" | "PATRON",
    dietaryRequirements: "Standard",
    accommodationNeeded: true,
    transportNeeded: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    guardianName: "",
    guardianPhone: "",
    guardianConsentGiven: false,
    dataConsentGiven: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load live chapters from API
  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setChapters(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Determine active chapter from code or fallback
  useEffect(() => {
    if (chapters.length === 0) return;
    if (chapterCode) {
      const clean = chapterCode.trim().toLowerCase();
      const found = chapters.find(
        (c) =>
          c.code.toLowerCase() === clean ||
          c.id.toLowerCase() === clean ||
          c.id.replace("ch-", "").toLowerCase() === clean
      );
      if (found) {
        setSelectedChapterId(found.id);
        return;
      }
    }
    if (!selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapterCode, chapters, selectedChapterId]);

  const activeChapter = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId) || chapters[0] || MEMBER_CHAPTERS[0];
  }, [chapters, selectedChapterId]);

  // Handle checking status
  const handleCheckRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryId = checkingId.trim();
    if (!queryId) return;

    setIsChecking(true);
    setCheckResult(null);
    setSubmitError(null);

    try {
      const res = await fetch(
        `/api/attendees/check?id=${encodeURIComponent(queryId)}&rallyId=${CURRENT_RALLY.id}`
      );
      const data = await res.json();
      if (data.success) {
        setCheckResult({
          performed: true,
          exists: data.exists,
          registeredByAdmin: data.registeredByAdmin,
          attendee: data.attendee,
          message: data.message,
        });

        if (!data.exists) {
          setFormData((prev) => ({
            ...prev,
            admissionOrIdNumber: queryId.toUpperCase(),
          }));
        }
      } else {
        setSubmitError(data.error || "Unable to verify registration status");
      }
    } catch {
      setSubmitError("Network error while checking registration.");
    } finally {
      setIsChecking(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (formData.ageCategory === "UNDER_18" && !formData.guardianConsentGiven) {
      setSubmitError("Parental / Guardian consent is required for delegates under 18 years of age.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: Partial<Attendee> = {
        rallyId: CURRENT_RALLY.id,
        chapterId: activeChapter.id,
        fullName: formData.fullName.trim(),
        admissionOrIdNumber: formData.admissionOrIdNumber.trim().toUpperCase(),
        phone: formData.phone.trim() || undefined,
        gender: formData.gender,
        ageCategory: formData.ageCategory,
        department: formData.department.trim() || "General Studies",
        role: formData.role,
        dietaryRequirements: formData.dietaryRequirements,
        accommodationNeeded: formData.accommodationNeeded,
        transportNeeded: formData.transportNeeded,
        emergencyContactName: formData.emergencyContactName.trim() || "Chapter Patron",
        emergencyContactPhone: formData.emergencyContactPhone.trim() || activeChapter.patronPhone || "+254 700 000 000",
        status: formData.ageCategory === "UNDER_18" && !formData.guardianConsentGiven ? "PENDING_CONSENT" : "CONFIRMED",
        registrationSource: "SELF_LINK",
        guardianConsent:
          formData.ageCategory === "UNDER_18"
            ? {
                guardianName: formData.guardianName.trim() || "Parent/Guardian",
                guardianPhone: formData.guardianPhone.trim() || "+254 700 000 000",
                consentGiven: formData.guardianConsentGiven,
                consentDate: new Date().toISOString().split("T")[0],
              }
            : undefined,
      };

      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setRegisteredAttendee(json.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(json.error || "Failed to submit registration. Please try again.");
      }
    } catch {
      setSubmitError("A connection error occurred. Please verify your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRegistrationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register/${activeChapter.code.toLowerCase()}`
    : `https://cucaso.org/register/${activeChapter.code.toLowerCase()}`;

  const copyRegistrationLink = () => {
    navigator.clipboard.writeText(currentRegistrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Top Hero Banner */}
        <section className="relative pt-32 pb-16 bg-navy-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coastal Unity Rally 2026 • Delegate Accreditation</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
              Institutional Delegate Registration
            </h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Official registration portal for Seventh-day Adventist university and college students attending the {CURRENT_RALLY.title}. Check if your chapter leadership has registered you, or submit your delegate accreditation details.
            </p>

            {/* Institution Badge Pill */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                {activeChapter.logoUrl ? (
                  <img src={activeChapter.logoUrl} alt={activeChapter.institutionName} className="w-full h-full object-cover" />
                ) : (
                  activeChapter.code.slice(0, 3)
                )}
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-teal-300 block">Accredited Institution</span>
                <span className="text-sm font-bold text-white block">{activeChapter.institutionName} ({activeChapter.chapterName})</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          
          {/* SUCCESS SCREEN: DIGITAL DELEGATE PASS */}
          {registeredAttendee ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                  Registration Confirmed!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your delegate accreditation for {CURRENT_RALLY.title} has been successfully recorded in the central CUCASO registry.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-dashed border-teal-500 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white p-6 sm:p-8 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <QrCode className="w-48 h-48 text-white" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-base shadow">
                      {activeChapter.logoUrl ? (
                        <img src={activeChapter.logoUrl} alt={activeChapter.institutionName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        "SDA"
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Official Rally Pass</span>
                      <span className="font-heading font-black text-lg text-white block">{activeChapter.institutionName}</span>
                      <span className="text-xs text-slate-300">{activeChapter.chapterName}</span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold inline-block">
                      {registeredAttendee.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">{registeredAttendee.admissionOrIdNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Delegate Name</span>
                    <span className="font-heading font-black text-xl text-white block mt-0.5">{registeredAttendee.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Role / Faculty</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">{registeredAttendee.role} • {registeredAttendee.department || "General"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Rally Dates</span>
                    <span className="font-medium text-slate-200 block mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>15 – 17 November 2026</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Venue</span>
                    <span className="font-medium text-slate-200 block mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{CURRENT_RALLY.venueName}, {CURRENT_RALLY.venueLocation}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: Self-Registered via Institutional Link</span>
                  <span className="font-mono">Ref: {registeredAttendee.id.slice(0, 10).toUpperCase()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print or Save Pass (PDF)</span>
                </button>
                <button
                  onClick={() => {
                    setRegisteredAttendee(null);
                    setCheckResult(null);
                    setCheckingId("");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Register Another Delegate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Chapter Selector & Sharing Hub (If multi-chapter or direct link) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Select Your Institution Chapter:
                  </label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => {
                      setSelectedChapterId(e.target.value);
                      setCheckResult(null);
                    }}
                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-navy-950 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.institutionName} ({ch.code}) — {ch.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  <button
                    onClick={copyRegistrationLink}
                    className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs flex items-center gap-2 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Institutional Link"}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Greetings brethren! Here is the official registration link for ${activeChapter.institutionName} SDA delegates attending the CUCASO Coastal Unity Rally 2026: ${currentRegistrationUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* STEP 1: PRE-REGISTRATION STATUS CHECK (The Core Requirement) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-xl text-navy-950">
                      Step 1: Check If You Are Already Registered
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Chapter executives and patrons frequently pre-register delegates in bulk. Enter your <strong>Student Admission Number</strong> or <strong>National ID</strong> below to check if you are already on the chapter roster.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheckRegistration} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. CT101/001/24 or 38492019"
                        value={checkingId}
                        onChange={(e) => setCheckingId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase placeholder:normal-case placeholder:font-normal focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChecking || !checkingId.trim()}
                      className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition flex-shrink-0"
                    >
                      {isChecking ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Checking Roster...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Check Registration Status</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* STATUS CHECK RESULTS */}
                {checkResult && checkResult.performed && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    {checkResult.exists && checkResult.attendee ? (
                      /* CASE A: ALREADY REGISTERED BY ADMIN OR PREVIOUSLY */
                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-heading font-black text-base text-emerald-900">
                              You Are Already Registered!
                            </h3>
                            <p className="text-xs text-emerald-800 mt-1">
                              {checkResult.registeredByAdmin
                                ? "✅ You have already been registered by your Chapter Leadership/Patron on the official delegate roster."
                                : "✅ You have already self-registered for this rally."}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[10px] uppercase">
                            {checkResult.attendee.status}
                          </span>
                        </div>

                        {/* Summary details table */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/80 border border-emerald-200 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                            <span className="font-bold text-navy-950 block mt-0.5">{checkResult.attendee.fullName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission / ID</span>
                            <span className="font-mono font-bold text-navy-950 block mt-0.5">{checkResult.attendee.admissionOrIdNumber}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Role & Faculty</span>
                            <span className="font-medium text-slate-700 block mt-0.5">{checkResult.attendee.role} ({checkResult.attendee.department || "General"})</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Source</span>
                            <span className="font-semibold text-teal-800 block mt-0.5">
                              {checkResult.registeredByAdmin ? "Chapter Admin Roster" : "Self-Registered"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Date</span>
                            <span className="text-slate-600 block mt-0.5">{checkResult.attendee.registrationDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rally Accreditation</span>
                            <span className="text-emerald-700 font-bold block mt-0.5">Confirmed Seat</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-emerald-800 italic">
                            No duplicate registration is required. We look forward to seeing you at the rally!
                          </span>
                          <button
                            type="button"
                            onClick={() => setRegisteredAttendee(checkResult.attendee!)}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Digital Pass</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* CASE B: NOT REGISTERED YET — PROCEED WITH FORM */
                      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-amber-900">
                            No Prior Registration Found for ID &ldquo;{checkingId}&rdquo;
                          </h4>
                          <p className="text-xs text-amber-800 mt-1">
                            You have not been registered by your chapter admin yet. Please complete the delegate form below to secure your accreditation!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: REGISTRATION FORM (Always visible or unlocked) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-navy-50 border border-navy-200 text-navy-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-xl text-navy-950">
                      Step 2: Delegate Accreditation Form
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Registering under <strong>{activeChapter.institutionName}</strong> ({activeChapter.chapterName}).
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Full Legal / Student Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Timothy Omwamba"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Admission No. / National ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CT101/001/24"
                        value={formData.admissionOrIdNumber}
                        onChange={(e) => setFormData({ ...formData, admissionOrIdNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0712 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Department / Program of Study
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Electrical Engineering / Nursing"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Age Category *
                      </label>
                      <select
                        value={formData.ageCategory}
                        onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        <option value="ADULT">Adult (18 Years & Above)</option>
                        <option value="UNDER_18">Minor (Under 18 Years)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Rally Participation Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        <option value="DELEGATE">Regular Delegate</option>
                        <option value="LEADER">Chapter Executive / Leader</option>
                        <option value="PATRON">Patron / Faculty Advisor</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Dietary Preference
                      </label>
                      <select
                        value={formData.dietaryRequirements}
                        onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        <option value="Standard">Standard Adventist Meal</option>
                        <option value="Strict Vegetarian">Strict Vegetarian (Vegan)</option>
                        <option value="Gluten Free">Gluten Free</option>
                        <option value="Diabetic">Diabetic Friendly</option>
                      </select>
                    </div>
                  </div>

                  {/* Logistics & Emergency */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Emergency Contact & Logistics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Emergency Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Parent, Guardian or Next of Kin"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Emergency Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0722 000 111"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.accommodationNeeded}
                          onChange={(e) => setFormData({ ...formData, accommodationNeeded: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span>I require chapter camp/hostel accommodation</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.transportNeeded}
                          onChange={(e) => setFormData({ ...formData, transportNeeded: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span>I require chapter-chartered bus transit</span>
                      </label>
                    </div>
                  </div>

                  {/* Under 18 Guardian Consent Section */}
                  {formData.ageCategory === "UNDER_18" && (
                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase">
                        <ShieldCheck className="w-4 h-4 text-blue-700" />
                        <span>Guardian Verification (KDPA Minor Safeguarding)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Parent / Legal Guardian Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Full name of guardian"
                            value={formData.guardianName}
                            onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">Parent / Guardian Phone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Phone for consent confirmation"
                            value={formData.guardianPhone}
                            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-blue-950 pt-1">
                        <input
                          type="checkbox"
                          required
                          checked={formData.guardianConsentGiven}
                          onChange={(e) => setFormData({ ...formData, guardianConsentGiven: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                        />
                        <span>I confirm that my parent/guardian has authorized my participation in the CUCASO Coastal Unity Rally 2026 and can be contacted for validation.</span>
                      </label>
                    </div>
                  )}

                  {/* Submission Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-700/20 flex items-center justify-center gap-2 transition"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing Accreditation...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-5 h-5 text-amber-300" />
                          <span>Complete Registration & Generate Official Rally Pass</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Secured under CUCASO Constitution & Kenya Data Protection Act (KDPA). No fees charged for registration submission.
                    </p>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
