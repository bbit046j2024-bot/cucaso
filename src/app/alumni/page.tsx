"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  Building2,
  Calendar
} from "lucide-react";

export default function AlumniPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institutionGraduated: "",
    graduationYear: "2023",
    profession: "",
    areasOfInterest: [] as string[],
  });

  const toggleInterest = (area: string) => {
    if (formData.areasOfInterest.includes(area)) {
      setFormData({
        ...formData,
        areasOfInterest: formData.areasOfInterest.filter((a) => a !== area),
      });
    } else {
      setFormData({
        ...formData,
        areasOfInterest: [...formData.areasOfInterest, area],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const opportunities = [
    {
      title: "Student Career Mentorship",
      desc: "Guide graduating Adventist students into industry, review resumes, and provide professional and spiritual coaching.",
      icon: Briefcase,
    },
    {
      title: "Rally & Convention Speaking",
      desc: "Share your professional testimonies, work-faith balance, and technical skills during coastal youth conventions.",
      icon: Users,
    },
    {
      title: "Associate Membership",
      desc: "Formally join CUCASO as an Associate Member per the Constitution to participate in governance advisory and alumni forums.",
      icon: HeartHandshake,
    },
    {
      title: "Project & Financial Sponsorship",
      desc: "Sponsor student delegates, support venue infrastructure, and fund regional literature evangelism campaigns.",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-navy-950 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                CUCASO Alumni Community
              </span>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white mt-4 mb-4">
                The Journey Continues <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-300">
                  Beyond Campus
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Adventist professionals and graduates from coastal universities and colleges: reconnect with your campus roots, mentor the next generation, and advance the mission together.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Alumni Engagement */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-heading font-black text-3xl text-navy-950">
                How Alumni Empower CUCASO
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                The CUCASO Constitution provides for Associate Membership for recognized alumni, creating a lasting bridge between campus fellowship and professional life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {opportunities.map((opp) => {
                const Icon = opp.icon;
                return (
                  <div key={opp.title} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {opp.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy-950">
                  Register with CUCASO Alumni Network
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Stay informed on upcoming coastal rallies, participate in career symposiums, and connect with fellow Adventist alumni.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-heading font-bold text-lg text-emerald-950">
                    Welcome to the Alumni Network!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for connecting with CUCASO. The Alumni Coordinator and Secretariat will reach out with the alumni directory and mentorship schedules.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-navy-900 text-white font-bold text-xs"
                  >
                    Return to Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Dr. Brian Otieno"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="brian@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Phone Number (WhatsApp)
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 7..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Institution Graduated From
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.institutionGraduated}
                        onChange={(e) => setFormData({ ...formData, institutionGraduated: e.target.value })}
                        placeholder="e.g. TUM, Pwani University, KMTC"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Year of Graduation
                      </label>
                      <input
                        type="number"
                        min="1990"
                        max="2026"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Current Profession / Industry
                      </label>
                      <input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="e.g. Software Engineer / Clinical Officer"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Ways You Would Like to Support
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        "Career & CV Mentorship",
                        "Speaking at Rallies",
                        "Associate Membership",
                        "Financial Sponsorship",
                        "Medical Camp Volunteer",
                        "Choir / Musical Ministry",
                      ].map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.areasOfInterest.includes(item)}
                            onChange={() => toggleInterest(item)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-navy-950 text-white font-bold text-sm hover:bg-navy-900 transition-colors shadow-md mt-4"
                  >
                    Submit Alumni Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
