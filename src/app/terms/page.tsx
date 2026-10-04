"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  FileText,
  Scale,
  CheckCircle,
  AlertTriangle,
  Building2,
  DollarSign,
  Users,
  ArrowLeft,
  Printer,
} from "lucide-react";

export default function TermsAndConditionsPage() {
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
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
                <span>Print Terms</span>
              </button>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Terms & Conditions of Service
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
              Rules, governance frameworks, financial procedures, and participation standards governing member chapters, delegates, leaders, and portal users across CUCASO.
            </p>
          </div>
        </section>

        {/* Terms Body */}
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
              {/* 1. Agreement to Terms */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <span>1. Agreement to Terms & Authority</span>
                </h2>
                <p>
                  By accessing the <strong>CUCASO Digital Platform (cucaso.org)</strong>, submitting a chapter registration application, participating in regional rallies, remitting funds via M-Pesa or bank transfer, or logging into the administrative portal, you agree to be bound by these <strong>Terms and Conditions</strong> and the <strong>CUCASO Regional Constitution</strong>.
                </p>
                <p className="mt-2">
                  If you are registering an institution on behalf of a student group, fellowship, or chaplaincy, you warrant that you are an authorized student leader, patron, or chaplain with authority to represent that institutional body.
                </p>
              </div>

              {/* 2. Doctrinal Alignment & Purpose */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-700" />
                  <span>2. Doctrinal Alignment & Adventist Ethos</span>
                </h2>
                <p>
                  CUCASO is dedicated to the spiritual, moral, mental, and social development of tertiary students in harmony with the Holy Scriptures and the fundamental beliefs of the <strong>Seventh-day Adventist Church</strong>.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                  <li>Member chapters and representatives shall conduct all inter-campus programs in a manner honouring Christian values, modesty, peace, and spiritual fellowship.</li>
                  <li>Programs, musical items, and literature distributed during CUCASO gatherings must conform to recognized Seventh-day Adventist standards.</li>
                </ul>
              </div>

              {/* 3. Coastal Rally Registration & Code of Conduct */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-700" />
                  <span>3. Rally & Event Code of Conduct</span>
                </h2>
                <p>
                  Participants at CUCASO conventions, rallies, leadership retreats, and music festivals are expected to maintain exemplary Christian discipline:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Substance-Free Campuses</strong>
                    <p className="text-xs text-slate-600">Alcohol, tobacco, illegal drugs, and disorderly conduct are strictly prohibited at all official rally venues and accommodation premises.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <strong className="block text-navy-950 text-xs uppercase tracking-wide mb-1">Delegate Accreditation</strong>
                    <p className="text-xs text-slate-600">Only registered attendees submitted by authenticated chapter representatives and cleared through the portal will be granted entry badges and meal access.</p>
                  </div>
                </div>
              </div>

              {/* 4. Financial Procedures & Capitation Fees */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-700" />
                  <span>4. Financial Remittances & Capability Model</span>
                </h2>
                <p>
                  In accordance with the CUCASO Capability-Based Funding Model (ADR-002), rally registration fees are assessed proportionally based on institutional tiering, member capacity, and logistics requirements:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                  <li><strong>Official Channels:</strong> All payments must be made strictly to the official Safaricom M-Pesa Paybill <strong>That will be communicated</strong> or through the direct STK Push prompt on this website. Cash payments to unauthorized individuals are strictly invalid.</li>
                  <li><strong>Fee Lock Date:</strong> Chapter registration numbers and calculated fees become binding on the announced Fee Lock Date. Subsequent adjustments require Central Council Treasurer sign-off.</li>
                  <li><strong>Refund Policy:</strong> Due to upfront non-refundable procurement of food, tenting, venue security, and transportation hire, capitation fees paid are non-refundable once the logistical commitment window has commenced.</li>
                </ul>
              </div>

              {/* 5. Account Security & Portal Passwords */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-700" />
                  <span>5. Portal Accounts & Access Control</span>
                </h2>
                <p>
                  Chapter representatives and executive council members are solely responsible for maintaining the confidentiality of their portal passwords and authentication tokens. Any action taken under an authenticated account shall be deemed authorized by the respective chapter or officer.
                </p>
              </div>

              {/* 6. Governing Law & Dispute Resolution */}
              <div>
                <h2 className="font-heading font-black text-xl text-navy-950 mb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-teal-700" />
                  <span>6. Governing Law & Christian Conciliation</span>
                </h2>
                <p>
                  These terms are governed by and construed in accordance with the <strong>laws of the Republic of Kenya</strong>. In the spirit of <em>1 Corinthians 6:1-7</em>, any disagreement or dispute arising under these terms shall first be referred to internal Christian mediation before the CUCASO Advisory Board and Regional Chaplaincy before seeking external legal remedies.
                </p>
              </div>

              {/* Footer contact */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <span>Coastal Universities & Colleges Adventist Students Organization</span>
                <Link href="/contact" className="text-teal-700 font-bold hover:underline">
                  Contact Central Secretariat →
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
