"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Heart,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Phone,
  HelpCircle,
  FileText,
  DollarSign
} from "lucide-react";

export default function SupportPage() {
  const supportPillars = [
    {
      title: "Student Welfare & Subsidies",
      desc: "Sponsoring students to ensure no delegate is left behind due to registration or meal costs.",
      icon: Heart,
    },
    {
      title: "Rally & Convention Logistics",
      desc: "Funding high-quality venue hire, PA sound equipment, security, tents, and sanitary amenities across host campuses.",
      icon: Building2,
    },
    {
      title: "Coastal Literature Evangelism",
      desc: "Printing and purchasing Christian literature, Ellen G. White books, and Bibles distributed freely during coastal community missions.",
      icon: Sparkles,
    },
    {
      title: "Student Leadership Development",
      desc: "Conducting executive training camps and chaplaincy workshops for newly elected chapter leaders each academic year.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                Giving & Stewardship
              </span>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white mt-4 mb-4">
                Support the Mission <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-300">
                  Across the Coast
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Your partnership empowers thousands of Adventist youth across universities and colleges in coast region to worship, grow, and bring Christ&apos;s hope to our campuses.
              </p>
            </div>
          </div>
        </section>

        {/* Support Areas */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-heading font-black text-3xl text-navy-950">
                Where Your Giving Goes
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                All contributions are governed under CUCASO constitutional financial procedures and reviewed by the Central Treasury.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportPillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Giving Procedures Card */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-navy-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                  Official Channels
                </span>
                <h3 className="font-heading font-black text-3xl text-white mt-4 mb-3">
                  Approved Financial Remittance
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
                  To protect our donors and ensure absolute accountability, all donations and chapter capitations must flow through verified organizational accounts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* M-Pesa Paybill */}
                  <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <span className="text-[10px] uppercase font-bold text-teal-300 block mb-1">Mobile Money</span>
                    <h4 className="font-heading font-black text-xl text-white mb-2">Safaricom M-Pesa Paybill</h4>
                    <div className="space-y-1 font-mono text-xs text-slate-200">
                      <div><strong>Business No:</strong> coming soon</div>
                      <div><strong>Account No:</strong> coming soon</div>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Direct Bank Wire</span>
                    <h4 className="font-heading font-black text-xl text-white mb-2">Central Bank / KCB</h4>
                    <div className="space-y-1 font-mono text-xs text-slate-200">
                      <div><strong>Bank:</strong> coming soon</div>
                      <div><strong>Branch:</strong> coming soon</div>
                      <div><strong>Ref:</strong> coming soon</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
                  <span>Questions about giving? Contact the Central Treasurer.</span>
                  <Link
                    href="/contact"
                    className="text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    Contact Treasury Team →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
