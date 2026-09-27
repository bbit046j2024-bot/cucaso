"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Heart,
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Download,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

export default function SupportPage() {
  const [selectedCause, setSelectedCause] = useState("Student Welfare & Subsidies");
  const [amount, setAmount] = useState<number | string>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedPaybill, setCopiedPaybill] = useState(false);

  // STK Push Modal State
  const [showModal, setShowModal] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"PENDING" | "SUCCESS" | "FAILED" | "CANCELLED">("PENDING");
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const presetAmounts = [250, 500, 1000, 2500, 5000];

  const causes = [
    {
      title: "Student Welfare & Subsidies",
      desc: "Sponsoring students to ensure no delegate is left behind due to registration or meal costs.",
      icon: Heart,
    },
    {
      title: "Rally & Convention Logistics",
      desc: "Funding high-quality venue hire, PA sound equipment, tents, and amenities across host campuses.",
      icon: Building2,
    },
    {
      title: "Coastal Literature Evangelism",
      desc: "Distributing Christian literature, Ellen G. White books, and Bibles during coastal outreach.",
      icon: Sparkles,
    },
    {
      title: "Student Leadership Development",
      desc: "Executive training camps and chaplaincy workshops for newly elected chapter leaders.",
      icon: Users,
    },
  ];

  // Poll for STK Push status while in PENDING state
  useEffect(() => {
    let intervalId: any;

    if (showModal && checkoutRequestId && checkoutStatus === "PENDING") {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/daraja/query-status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`);
          const data = await res.json();

          if (data.success && data.status) {
            if (data.status === "SUCCESS") {
              setCheckoutStatus("SUCCESS");
              setMpesaReceipt(data.mpesaReceipt || "CONFIRMED");
              clearInterval(intervalId);
            } else if (data.status === "CANCELLED" || data.status === "FAILED") {
              setCheckoutStatus(data.status);
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error("Status polling failed:", err);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showModal, checkoutRequestId, checkoutStatus]);

  const handleInitiateStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const finalAmount = amount === "custom" ? Number(customAmount) : Number(amount);
    if (!finalAmount || finalAmount < 1) {
      setErrorMessage("Please select or enter a valid donation amount (minimum KES 1).");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter your M-Pesa phone number to receive the prompt.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/daraja/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: finalAmount,
          purpose: selectedCause,
          donorName: donorName.trim() || "Generous Supporter",
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate M-Pesa STK Push");
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setCheckoutStatus("PENDING");
      setIsSimulated(Boolean(data.simulated));
      setShowModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPaybill(true);
    setTimeout(() => setCopiedPaybill(false), 2000);
  };

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
                Your partnership empowers thousands of Adventist youth across universities and colleges in the coastal region to worship, grow, and bring Christ&apos;s hope to our campuses.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Giving & Procedures Section */}
        <section className="py-12 md:py-16 -mt-8 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* STK Push Card (Col 7) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                      Direct Mobile Remittance
                    </span>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950 mt-1">
                      Give via M-Pesa STK Push
                    </h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instant Prompt</span>
                  </div>
                </div>

                <form onSubmit={handleInitiateStkPush} className="space-y-6">
                  {/* Select Ministry / Cause */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      1. Select Ministry Area
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {causes.map((c) => {
                        const Icon = c.icon;
                        const isSelected = selectedCause === c.title;
                        return (
                          <button
                            type="button"
                            key={c.title}
                            onClick={() => setSelectedCause(c.title)}
                            className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                              isSelected
                                ? "bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-1 ring-teal-600"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl flex-shrink-0 ${
                                isSelected ? "bg-teal-600 text-white" : "bg-white text-slate-500 border border-slate-200"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">{c.title}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Amount */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      2. Choose Amount (KES)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {presetAmounts.map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => {
                            setAmount(val);
                            setCustomAmount("");
                          }}
                          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                            amount === val
                              ? "bg-navy-950 border-navy-950 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAmount("custom")}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                          amount === "custom"
                            ? "bg-navy-950 border-navy-950 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {amount === "custom" && (
                      <div className="mt-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter custom amount in KES"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Donor Contact & Phone */}
                  <div className="space-y-4 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Donor Details & M-Pesa Phone
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        M-Pesa Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-xl shadow-sm overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-teal-600">
                        <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-bold text-xs select-none border-r border-slate-300 gap-1.5 flex-shrink-0">
                          <span>🇰🇪</span>
                          <span>+254</span>
                        </span>
                        <input
                          type="tel"
                          placeholder="712 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 min-w-0 px-4 py-3 text-sm font-mono font-bold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1.5 block">
                        A prompt will pop up on this phone screen requesting your M-Pesa PIN.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Full Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Elder Samuel Mwangi"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Email (For Official Tax Receipt)
                        </label>
                        <input
                          type="email"
                          placeholder="samuel@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#00897B", color: "#ffffff" }}
                    className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-heading font-black text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span className="text-white font-bold">Sending M-Pesa Prompt to Your Phone...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 text-amber-300" />
                        <span className="text-white font-bold">
                          Pay KES{" "}
                          {(amount === "custom" ? Number(customAmount) || 0 : Number(amount)).toLocaleString()}{" "}
                          via M-Pesa STK
                        </span>
                        <ArrowRight className="w-5 h-5 text-white/90" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Offline Paybill & Bank Wire Procedures (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Official Paybill Card */}
                <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-navy-800 shadow-xl relative overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    Manual / Offline Giving
                  </span>
                  <h3 className="font-heading font-black text-2xl text-white mt-3 mb-2">
                    Official M-Pesa Paybill
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    If you prefer manual remission, enter the official CUCASO Paybill on your SIM Toolkit or M-Pesa App.
                  </p>

                  <div className="space-y-3 font-mono text-sm bg-white/10 p-5 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400 text-xs">Business No:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-400 text-lg">4082200</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("4082200")}
                          className="p-1 rounded hover:bg-white/10 text-slate-300"
                          title="Copy Paybill"
                        >
                          {copiedPaybill ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400 text-xs">Account No:</span>
                      <strong className="text-teal-300 text-xs sm:text-sm">DONATE or [CAUSE]</strong>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Instant automatic SMS reconciliation for registered chapters & supporters.</span>
                  </div>
                </div>

                {/* Direct Bank Wire */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Direct Bank Transfer
                  </span>
                  <h3 className="font-heading font-black text-xl text-navy-950 mt-3 mb-1">
                    Institutional Wire
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Recommended for endowments, alumni corporate matchings, and large capitation remittances.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700">
                    <div><strong>Bank:</strong> Kenya Commercial Bank (KCB)</div>
                    <div><strong>Branch:</strong> Mombasa Main Branch</div>
                    <div><strong>Account Name:</strong> CUCASO Regional Council</div>
                    <div><strong>Reference:</strong> [Your Name / Chapter Code]</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Need wire transfer invoice?</span>
                    <Link href="/contact" className="text-teal-700 font-bold hover:underline">
                      Contact Treasury →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Pillars Grid */}
        <section className="py-16 md:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-heading font-black text-3xl text-navy-950">
                Where Your Giving Goes
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                All contributions are governed under CUCASO constitutional financial procedures and audited by the Central Council.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {causes.map((item) => {
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
      </main>

      {/* STK Push Live Status Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center relative overflow-hidden">
            {checkoutStatus === "PENDING" && (
              <div className="space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center relative">
                  <Phone className="w-10 h-10 animate-bounce" />
                  <span className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy-950">
                  Check Your Phone
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  An M-Pesa prompt has been dispatched to <strong>{phone}</strong>. Enter your M-Pesa PIN to complete your donation of{" "}
                  <strong>
                    KES {(amount === "custom" ? Number(customAmount) || 0 : Number(amount)).toLocaleString()}
                  </strong>.
                </p>

                {isSimulated && (
                  <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    ⚡ Sandbox Simulation Active (auto-completes in 3s)
                  </span>
                )}

                <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Awaiting Safaricom confirmation...</span>
                </div>
              </div>
            )}

            {checkoutStatus === "SUCCESS" && (
              <div className="space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy-950">
                  Donation Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
                  Thank you for your generosity! Your gift directly empowers Seventh-day Adventist student ministry across the Coast.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left font-mono text-xs space-y-1.5 my-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">M-Pesa Receipt:</span>
                    <strong className="text-teal-700 font-bold">{mpesaReceipt}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <strong>KES {(amount === "custom" ? Number(customAmount) || 0 : Number(amount)).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ministry:</span>
                    <span className="truncate max-w-[160px] text-slate-700">{selectedCause}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Print / Save Official Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setCheckoutStatus("PENDING");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {(checkoutStatus === "FAILED" || checkoutStatus === "CANCELLED") && (
              <div className="space-y-4 py-4">
                <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy-950">
                  {checkoutStatus === "CANCELLED" ? "Payment Cancelled" : "Transaction Failed"}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {checkoutStatus === "CANCELLED"
                    ? "The prompt was cancelled on the phone. You can retry whenever you are ready."
                    : "Safaricom was unable to complete the transaction. Please check your M-Pesa balance or try again."}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setCheckoutStatus("PENDING");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-navy-950 text-white font-bold text-xs hover:bg-navy-900 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
