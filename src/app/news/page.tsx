"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { 
  Bell, 
  Calendar, 
  Tag, 
  User, 
  ArrowRight, 
  Sparkles, 
  Megaphone, 
  BookOpen, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const newsItems = [
    {
      id: "news-1",
      category: "ANNOUNCEMENT",
      title: "Administration Council Finalizes Q1 2026 Coastal Spiritual Rally Venue",
      summary: "Delegates from 12 member chapters will convene at Technical University of Mombasa (TUM) for an unforgettable weekend of faith, prayer, and choral ministry.",
      date: "September 18, 2026",
      author: "Secretariat & Comms Office",
      featured: true,
      readTime: "3 min read",
    },
    {
      id: "news-2",
      category: "FINANCE",
      title: "Central Treasury Publishes Capability-Weighted Capitation Framework",
      summary: "In accordance with PRD Section 6, the capability cost engine has been ratified to ensure fair financial sharing between large universities and technical institutes.",
      date: "September 12, 2026",
      author: "Central Treasurer",
      featured: false,
      readTime: "4 min read",
    },
    {
      id: "news-3",
      category: "SPIRITUAL",
      title: "Pastoral Letter: Anchored in Faith Amidst Academic Pressures",
      summary: "A heartfelt message from the CUCASO Chaplaincy to all tertiary students preparing for continuous assessment tests and end-of-semester examinations.",
      date: "September 05, 2026",
      author: "Pastor Eric Musembi (Patron & Chaplain)",
      featured: false,
      readTime: "5 min read",
    },
    {
      id: "news-4",
      category: "CAMPUS_SPOTLIGHT",
      title: "Pwani University Chapter Holds Successful Medical Camp in Kilifi",
      summary: "Over 350 residents received free blood pressure screenings, optical checks, and Christian literature through joint student volunteer efforts.",
      date: "August 28, 2026",
      author: "Pwani SDA Comms Secretary",
      featured: false,
      readTime: "3 min read",
    },
    {
      id: "news-5",
      category: "GOVERNANCE",
      title: "KMTC Port Reitz Chapter Formally Ratified with Tier 2 Capability Status",
      summary: "The CUCASO Administration Council unanimously voted to approve the chapter charter application following patron endorsement and leadership compliance.",
      date: "August 20, 2026",
      author: "CUCASO Executive Council",
      featured: false,
      readTime: "2 min read",
    },
  ];

  const filteredNews = selectedCategory === "ALL" 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: "ALL", label: "All Bulletins" },
    { id: "ANNOUNCEMENT", label: "Official Notices" },
    { id: "FINANCE", label: "Treasury & Rallies" },
    { id: "SPIRITUAL", label: "Pastoral & Devotionals" },
    { id: "CAMPUS_SPOTLIGHT", label: "Campus Spotlights" },
    { id: "GOVERNANCE", label: "Council Resolutions" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                Proposal §14: News & Announcements
              </span>
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-white mt-4 mb-4">
                CUCASO News & Bulletins
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Stay updated with verified circulars, Council decisions, campus mission reports, and upcoming regional rally announcements.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <div className="bg-white border-b border-slate-200 sticky top-20 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="flex gap-2 py-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-navy-950 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* News Feed */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </span>
                    </div>

                    <h2 className="font-heading font-bold text-xl text-navy-950 mb-3 hover:text-teal-700 transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-body">
                      {item.summary}
                    </p>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.author}</span>
                    </span>
                    <span className="text-teal-700 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                      <span>Read Story</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
