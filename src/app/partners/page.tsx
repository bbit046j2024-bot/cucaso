"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Building2,
  Church,
  HeartHandshake,
  ShieldCheck,
  Award,
  Globe2,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function PartnersPage() {
  const partnerCategories = [
    {
      category: "Ecclesiastical & Church Partners",
      desc: "Our organizational parentage and spiritual oversight anchored within the Seventh-day Adventist Church structure.",
      icon: Church,
      partners: [
        { name: "Kenya Coast Field of Seventh-day Adventists", role: "Spiritual Oversight & Chaplaincy Coordination", location: "Mombasa Central" },
        { name: "East Kenya Union Conference (EKUC)", role: "Youth & Campus Ministries Directorate", location: "Nairobi HQ" },
        { name: "Adventist Chaplaincy Ministries (ACM)", role: "Tertiary Education Campus Ministry Endorsement", location: "Regional" },
      ],
    },
    {
      category: "Higher Education Institutions",
      desc: "Host universities and tertiary colleges providing campus venues, patron support, and student welfare facilities.",
      icon: Building2,
      partners: [
        { name: "Technical University of Mombasa (TUM)", role: "Founding Campus Host & Engineering Hub", location: "Tudor, Mombasa" },
        { name: "Pwani University", role: "Regional Agricultural & Humanities Center", location: "Kilifi Town" },
        { name: "Kenya Medical Training College (KMTC Mombasa)", role: "Health Sciences & Medical Missions Partner", location: "Mombasa Island" },
        { name: "Kenyatta University (Mombasa Campus)", role: "Constituent Academic Outreach Partner", location: "Nyali, Mombasa" },
      ],
    },
    {
      category: "Community & Humanitarian Partners",
      desc: "Local health centers, municipal associations, and community leaders who partner in public service and outreach.",
      icon: HeartHandshake,
      partners: [
        { name: "Mombasa County Health Services", role: "Public Medical Camps & Blood Donation Drives", location: "Mombasa" },
        { name: "ADRA Kenya (Adventist Development and Relief Agency)", role: "Community Disaster Preparedness & Relief", location: "Coast Regional Office" },
      ],
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
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white mt-4 mb-4">
                Partners & Supporters
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Recognizing the conferences, academic institutions, community sponsors, and well-wishers who stand with Adventist students across the Coast.
              </p>
            </div>
          </div>
        </section>

        {/* Partners Showcase */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {partnerCategories.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.category} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <GroupIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-2xl text-navy-950">
                        {group.category}
                      </h2>
                      <p className="text-xs text-slate-500">{group.desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.partners.map((partner) => (
                      <div key={partner.name} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                            {partner.location}
                          </span>
                          <h3 className="font-heading font-bold text-base text-navy-950 mb-2">
                            {partner.name}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {partner.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Partnership Call to Action */}
        <section className="py-16 bg-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mb-3">
              Become a Mission Partner
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-6">
              Is your church, company, foundation, or alumni association interested in collaborating with CUCASO for youth summits, literature evangelism, or health expos?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 transition-colors shadow-md flex items-center gap-2"
              >
                <span>Inquire About Partnership</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/support"
                className="px-6 py-3 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Financial Stewardship
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
