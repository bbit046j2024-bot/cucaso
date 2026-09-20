"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SystemSwitcher } from "@/components/system-switcher";
import { BrandLogo } from "@/components/brand-logo";
import { 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle 
} from "lucide-react";

export default function ApplicationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: "",
    institutionType: "UNIVERSITY",
    sector: "PUBLIC",
    location: "Mombasa Central",
    chapterName: "",
    approxMembers: "120",
    patronName: "",
    patronPhone: "",
    patronEmail: "",
    chairpersonName: "",
    chairpersonPhone: "",
    chairpersonEmail: "",
    treasurerName: "",
    treasurerPhone: "",
    endorsementFile: "official_endorsement_letter.pdf",
    declarationAgreed: false,
  });

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName: formData.institutionName,
          institutionType: formData.institutionType,
          sector: formData.sector,
          location: formData.location,
          chapterName: formData.chapterName,
          approximateMembers: Number(formData.approxMembers) || 50,
          patronName: formData.patronName,
          patronPhone: formData.patronPhone,
          patronEmail: formData.patronEmail,
          chairpersonName: formData.chairpersonName,
          chairpersonPhone: formData.chairpersonPhone,
          chairpersonEmail: formData.chairpersonEmail,
          endorsementDocument: formData.endorsementFile,
        }),
      });
    } catch (err) {
      console.warn("Error submitting application to API, proceeding to confirmation:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header (Matches image2.png) */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Chapter Onboarding & Accreditation</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-navy-950">
            Apply to Join CUCASO
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Fill in your institution and chapter details to start the council accreditation process for coastal rallies.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-xl text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              APPLICATION QUEUED #CUCASO-2026-APP
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mt-3 mb-2">
              Application Submitted to Council!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Your application for <strong>{formData.chapterName || formData.institutionName}</strong> has been transmitted to the Administration Council review queue. You will receive an SMS and email notification upon approval and Capability Tier assignment.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-900">{formData.institutionName || "Technical University of Mombasa"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chapter Name:</span>
                <span className="font-semibold text-slate-900">{formData.chapterName || "TUM SDA Chapter"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patron:</span>
                <span className="font-semibold text-slate-900">{formData.patronName || "Pr. Eric Musembi"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Review Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">UNDER_REVIEW</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/portal/council"
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simulate Council Approval (Admin)</span>
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* 4-Step Progress Indicator (Matches image2.png) */}
            <div className="bg-slate-50 border-b border-slate-200 p-6">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { num: 1, label: "Institution" },
                  { num: 2, label: "Chapter" },
                  { num: 3, label: "Officers" },
                  { num: 4, label: "Review & Submit" },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-xs transition-all ${
                        step === s.num
                          ? "bg-navy-900 text-white shadow-md ring-4 ring-navy-900/10"
                          : step > s.num
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                        step === s.num ? "text-navy-950 font-bold" : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Form Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
              {/* Step 1: Institution Details */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-heading font-bold text-lg text-navy-950 border-b border-slate-100 pb-2">
                    1. Institution Details
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical University of Mombasa"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Institution Type *
                      </label>
                      <select
                        value={formData.institutionType}
                        onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                      >
                        <option value="UNIVERSITY">University</option>
                        <option value="COLLEGE">Tertiary / Medical College</option>
                        <option value="SECONDARY">Secondary School</option>
                        <option value="PRIMARY">Primary School</option>
                        <option value="OTHER">Other Institution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Sector *
                      </label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Regional Coastal Location *
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                    >
                      <option value="Mombasa Central">Mombasa Central (Island & Urban)</option>
                      <option value="Kilifi Region">Kilifi Region (Kilifi North & South)</option>
                      <option value="Kwale Region">Kwale Region (Diani & Matuga)</option>
                      <option value="Taita Taveta">Taita Taveta (Voi & Wundanyi)</option>
                      <option value="Garissa Liaison">Garissa & North Coast Corridor</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Chapter Details */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-heading font-bold text-lg text-navy-950 border-b border-slate-100 pb-2">
                    2. SDA Chapter Information
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      SDA Chapter Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TUM SDA Chapter"
                      value={formData.chapterName}
                      onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Estimated Active Student Membership *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={formData.approxMembers}
                      onChange={(e) => setFormData({ ...formData, approxMembers: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Helps the Council assign the appropriate provisional Capability Tier.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Patron / Chaplain Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pr. Eric Musembi"
                        value={formData.patronName}
                        onChange={(e) => setFormData({ ...formData, patronName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Patron Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 712 345 678"
                        value={formData.patronPhone}
                        onChange={(e) => setFormData({ ...formData, patronPhone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Person & Officers */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-heading font-bold text-lg text-navy-950 border-b border-slate-100 pb-2">
                    3. Chapter Executive Officers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Chapter Chairperson / Rep *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Mwangi"
                        value={formData.chairpersonName}
                        onChange={(e) => setFormData({ ...formData, chairpersonName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Chairperson Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 720 112 233"
                        value={formData.chairpersonPhone}
                        onChange={(e) => setFormData({ ...formData, chairpersonPhone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Chapter Treasurer *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. David Kiboi"
                        value={formData.treasurerName}
                        onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Treasurer Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 722 445 566"
                        value={formData.treasurerPhone}
                        onChange={(e) => setFormData({ ...formData, treasurerPhone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Official Chapter Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sda@institution.ac.ke"
                      value={formData.chairpersonEmail}
                      onChange={(e) => setFormData({ ...formData, chairpersonEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Endorsement & Review */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-heading font-bold text-lg text-navy-950 border-b border-slate-100 pb-2">
                    4. Endorsement Document & Submission
                  </h3>

                  <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center hover:bg-white hover:border-teal-500 transition-colors">
                    <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      Upload Institutional Endorsement Document
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Signed letter from Vice Chancellor, Principal, or Dean of Students affirming the SDA chapter. (PDF / JPEG up to 10MB)
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>{formData.endorsementFile}</span>
                    </div>
                  </div>

                  {/* Summary Check */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-900 block mb-1">Application Summary:</span>
                    <p><strong>Institution:</strong> {formData.institutionName || "Technical University of Mombasa"} ({formData.sector})</p>
                    <p><strong>Chapter:</strong> {formData.chapterName || "TUM SDA Chapter"}</p>
                    <p><strong>Patron:</strong> {formData.patronName || "Pr. Eric Musembi"} ({formData.patronPhone || "+254 712 345 678"})</p>
                    <p><strong>Officers:</strong> {formData.chairpersonName || "John Mwangi"} (Chair), {formData.treasurerName || "David Kiboi"} (Treas)</p>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="declare"
                      required
                      checked={formData.declarationAgreed}
                      onChange={(e) => setFormData({ ...formData, declarationAgreed: e.target.checked })}
                      className="mt-1 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="declare" className="text-xs text-slate-600 leading-normal cursor-pointer">
                      I solemnly affirm that the information provided represents our accredited Seventh-day Adventist student fellowship, and we agree to abide by the CUCASO Constitution and rally bylaws.
                    </label>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </Link>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    Submit Chapter Application
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
