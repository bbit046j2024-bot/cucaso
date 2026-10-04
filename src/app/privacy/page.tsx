"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  AlertCircle,
  Mail,
  Building,
  ArrowLeft,
  Printer,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 28, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="bg-navy-950 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors border border-white/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Policy</span>
              </button>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Privacy Policy & Data Protection Notice
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
              How the Coastal Universities and Colleges Adventists Students Organization (CUCASO) collects, secures, processes, and protects your personal information under the laws of the Republic of Kenya.
            </p>
          </div>
        </section>

        {/* Policy Body */}
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
              {/* 1. Introduction */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-700" />
                  <span>1. Data Controller & Statutory Framework</span>
                </h2>
                <p>
                  The <strong>Coastal Universities and Colleges Adventists Students Organization (CUCASO)</strong>, operating as an autonomous regional umbrella body under the auspices of the Seventh-day Adventist Church in Kenya, is the <strong>Data Controller</strong> as defined by the <em>Kenya Data Protection Act, 2019 (Act No. 24 of 2019)</em>.
                </p>
                <p className="mt-2">
                  Our regional Secretariat is located in Mombasa, Kenya. We are committed to upholding the constitutional rights to privacy enshrined in <strong>Article 31(c) and (d) of the Constitution of Kenya, 2010</strong>, and complying with the statutory directives issued by the <strong>Office of the Data Protection Commissioner (ODPC)</strong>.
                </p>
              </div>

              {/* 2. Categories of Data Collected */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-700" />
                  <span>2. Information We Collect</span>
                </h2>
                <p>To coordinate student ministry, rallies, capitation, and governance, CUCASO collects:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                  <li><strong>Chapter Registration Data:</strong> Institution name, chapter executive officers (Chairperson, Secretary, Treasurer, Patron), contact phone numbers, and official emails.</li>
                  <li><strong>Rally & Event Delegate Information:</strong> Full legal names, national/student identification numbers, gender, academic departments, emergency contact names, and special dietary/accommodation requirements.</li>
                  <li><strong>Financial & Remittance Data:</strong> Safaricom M-Pesa transaction reference codes, sender phone numbers, amounts remitted, and timestamps. <em>Note: CUCASO never requests, stores, or accesses your personal M-Pesa PIN or mobile wallet credentials.</em></li>
                  <li><strong>Minor (Under-18) Records:</strong> Verified guardian consent declarations, parent emergency contacts, and institutional authorization endorsements.</li>
                  <li><strong>Chaplaincy & Prayer Requests:</strong> Submitter name, contact, and spiritual prayer petitions submitted voluntarily.</li>
                </ul>
              </div>

              {/* 3. Legal Basis for Processing */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <span>3. Legal Basis for Processing (KDPA)</span>
                </h2>
                <p>CUCASO processes personal data exclusively under the following lawful grounds:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Contractual Necessity</strong>
                    <p className="text-xs text-slate-600">Facilitating student accreditation, venue logistics, catering badges, and participation in annual coastal rallies.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Explicit Consent</strong>
                    <p className="text-xs text-slate-600">Obtained during voluntary chapter affiliation, donor STK Push remittance, newsletter subscriptions, and prayer request submissions.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Religious Non-Profit Activities</strong>
                    <p className="text-xs text-slate-600">Processing sensitive data (religious affiliation) as an authorized religious student ministry in accordance with Section 47 of the KDPA.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Vital Interests & Safeguarding</strong>
                    <p className="text-xs text-slate-600">Emergency medical contacts and guardian notifications for delegates during inter-county travel and encampments.</p>
                  </div>
                </div>
              </div>

              {/* 4. Data Security & Storage */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal-700" />
                  <span>4. Technical & Organizational Security</span>
                </h2>
                <p>
                  All credentials stored within the CUCASO platform are protected using industry-standard cryptography, including <strong>Argon2id password hashing</strong>, <strong>HTTP-Only secure SameSite session cookies</strong>, and TLS 1.3 encryption in transit.
                </p>
                <p className="mt-2">
                  Payment webhooks from Safaricom Daraja are validated via encrypted cryptographic tokens to prevent replay attacks and fraudulent credit attempts.
                </p>
              </div>

              {/* 5. Your Rights as a Data Subject */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-700" />
                  <span>5. Your Rights (KDPA Part IV)</span>
                </h2>
                <p>As a registered user, delegate, patron, or supporter, you have the right to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                  <li><strong>Access:</strong> Request a copy of your personal data held in the CUCASO database.</li>
                  <li><strong>Rectification:</strong> Request prompt correction of inaccurate or incomplete contact or chapter records.</li>
                  <li><strong>Erasure:</strong> Request the deletion of non-statutory personal data when processing is no longer necessary.</li>
                  <li><strong>Objection:</strong> Object to automated processing or promotional SMS/Email dispatch.</li>
                </ul>
              </div>

              {/* 6. Contact Data Protection Officer */}
              <div className="p-6 rounded-2xl bg-navy-50 border border-navy-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-navy-950">Questions or Data Requests?</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Contact the CUCASO Data Protection Liaison and Secretariat at <span className="font-mono text-teal-700">cucaso2025@gmail.com</span>.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-navy-950 text-white font-bold text-xs hover:bg-navy-900 transition-colors flex-shrink-0"
                >
                  Contact DPO Desk →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
