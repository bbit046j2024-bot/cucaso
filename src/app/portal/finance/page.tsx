"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  DollarSign,
  Lock,
  Receipt,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  CreditCard,
  Building2,
  Clock,
  X,
  FileCheck,
  AlertTriangle,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  exportChapterFinancialSummaryPDF,
  exportSingleInvoicePDF,
} from "@/lib/pdf-export";

interface InvoiceItem {
  id: string;
  invoiceNumber?: string;
  chapterId: string;
  institutionName: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  paymentReference: string;
  dueDate: string;
  status: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE" | "CANCELLED";
}

interface PaymentItem {
  id: string;
  invoiceId: string;
  chapterId: string;
  reference: string;
  amount: number;
  method: string;
  mpesaReceiptNumber?: string;
  payerName?: string;
  payerPhone?: string;
  status: "MATCHED" | "UNMATCHED" | "PENDING";
  timestamp: string;
}

export default function FinancePortalPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeLocked, setFeeLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "payments">("invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Syncing / Reconciling state
  const [syncing, setSyncing] = useState(false);

  // Manual payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    reference: "",
    method: "MPESA_C2B",
    payerName: "",
    payerPhone: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Council Custom Invoice state
  const [showCustomInvoiceModal, setShowCustomInvoiceModal] = useState(false);
  const [customInvoiceForm, setCustomInvoiceForm] = useState({
    chapterId: "",
    amountDue: "",
    dueDate: "",
  });
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, chapRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/payments"),
        fetch("/api/chapters"),
      ]);

      const [invJson, payJson, chapJson] = await Promise.all([
        invRes.json(),
        payRes.json(),
        chapRes.json(),
      ]);

      if (invJson.success && Array.isArray(invJson.data)) {
        setInvoices(invJson.data);
      }
      if (payJson.success && Array.isArray(payJson.data)) {
        setPayments(payJson.data);
      }
      if (chapJson.success && Array.isArray(chapJson.data)) {
        setChapters(chapJson.data);
      }
    } catch {
      showToast("error", "Failed to load financial records from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportLedger = () => {
    showToast("success", "Generating Chapter Financial Ledger (.pdf)...");
    try {
      exportChapterFinancialSummaryPDF({
        chapters: chapters.length > 0 ? chapters : invoices.map(i => ({ id: i.chapterId, code: i.paymentReference.replace("CUCASO-", ""), institutionName: i.institutionName, chapterName: i.institutionName, tierId: "TIER_3", attendeesCount: 0 } as any)),
        invoices: invoices as any,
        payments: payments as any,
        rallyTitle: "Annual Coastal Rally 2026",
      });
      showToast("success", "Downloaded CUCASO_Financial_Ledger.pdf!");
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to export PDF ledger.");
    }
  };

  const handleSaveCustomInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInvoiceForm.chapterId) {
      showToast("error", "Please select a chapter.");
      return;
    }
    const amt = parseFloat(customInvoiceForm.amountDue);
    if (isNaN(amt) || amt < 0) {
      showToast("error", "Enter a valid positive invoice amount.");
      return;
    }

    setSubmittingInvoice(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: customInvoiceForm.chapterId,
          amountDue: amt,
          dueDate: customInvoiceForm.dueDate || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Council invoice of KES ${amt.toLocaleString()} saved!`);
        setShowCustomInvoiceModal(false);
        setCustomInvoiceForm({ chapterId: "", amountDue: "", dueDate: "" });
        loadData();
      } else {
        showToast("error", json.error || "Failed to save invoice.");
      }
    } catch {
      showToast("error", "Network error saving invoice.");
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleSyncMpesa = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/payments?sync=true");
      const json = await res.json();
      if (json.success) {
        showToast(
          "success",
          `M-Pesa reconciliation complete. Checked ${json.data?.length ?? 0} transactions.`
        );
        loadData();
      } else {
        showToast("error", json.error || "Sync failed.");
      }
    } catch {
      showToast("error", "Network error running M-Pesa sync.");
    } finally {
      setSyncing(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amountNum = parseFloat(paymentForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("error", "Enter a valid positive payment amount.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          chapterId: selectedInvoice.chapterId,
          amount: amountNum,
          reference: paymentForm.reference || selectedInvoice.paymentReference,
          method: paymentForm.method,
          payerName: paymentForm.payerName || selectedInvoice.institutionName,
          payerPhone: paymentForm.payerPhone || "+254700000000",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("success", `Payment of KES ${amountNum.toLocaleString()} recorded!`);
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setPaymentForm({
          amount: "",
          reference: "",
          method: "MPESA_C2B",
          payerName: "",
          payerPhone: "",
        });
        loadData();
      } else {
        showToast("error", json.error || "Failed to record payment.");
      }
    } catch {
      showToast("error", "Network error recording payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Aggregated KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);

  // Filtered lists
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.institutionName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.paymentReference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter((pay) => {
    return (
      (pay.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pay.payerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pay.mpesaReceiptNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
              <DollarSign className="w-8 h-8 text-navy-800" />
              Central Treasurer Financial Ledger & Reconciliation
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Capability invoices, M-Pesa Daraja callback validation, and rally fee lock control (FR-COST-06, FR-PAY-03).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncMpesa}
              disabled={syncing || loading}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-teal-700" : ""}`} />
              {syncing ? "Reconciling M-Pesa…" : "Sync M-Pesa Callbacks"}
            </button>

            <button
              onClick={() => {
                setFeeLocked(!feeLocked);
                showToast("success", feeLocked ? "Rally fee lock released." : "Rally fee lock frozen.");
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${
                feeLocked
                  ? "bg-rose-700 text-white hover:bg-rose-800"
                  : "bg-amber-500 hover:bg-amber-600 text-navy-950"
              }`}
            >
              <Lock className="w-4 h-4" />
              {feeLocked ? "Fee Lock Frozen (Locked)" : "Freeze Rally Fee Lock"}
            </button>

            <button
              onClick={() => setShowCustomInvoiceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Issue Council Invoice</span>
            </button>

            <button
              onClick={handleExportLedger}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Download official PDF ledger document"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Export PDF Ledger</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-bold block">Total Invoiced</span>
            <span className="font-heading font-black text-3xl text-navy-900 mt-1 block">
              {formatCurrency(totalInvoiced)}
            </span>
            <span className="text-xs text-slate-500 mt-2 block">
              {invoices.length} active chapter invoices in ledger
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-bold block">Collected Payments</span>
            <span className="font-heading font-black text-3xl text-emerald-600 mt-1 block">
              {formatCurrency(totalCollected)}
            </span>
            <span className="text-xs text-emerald-700 font-bold mt-2 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> M-Pesa C2B & Verified Remittances
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-bold block">Outstanding Balance</span>
            <span className="font-heading font-black text-3xl text-amber-600 mt-1 block">
              {formatCurrency(outstandingBalance)}
            </span>
            <span className="text-xs text-amber-700 font-bold mt-2 block">
              {invoices.filter((i) => i.balance > 0).length} chapters with pending balances
            </span>
          </div>
        </div>

        {/* View Tabs & Search Bar */}
        <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chapter Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "payments"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Payment Ledger & Receipts ({payments.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search institution, receipt or ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            {activeTab === "invoices" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-navy-800" />
              <p className="text-xs font-bold">Loading live financial records from database…</p>
            </div>
          ) : activeTab === "invoices" ? (
            filteredInvoices.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No invoices found</p>
                <p className="text-xs text-slate-500 mt-1">Invoices are generated based on chapter capability tiers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                      <th className="py-3.5 px-4">Chapter & Institution</th>
                      <th className="py-3.5 px-4">Payment Ref</th>
                      <th className="py-3.5 px-4 text-right">Invoiced (KES)</th>
                      <th className="py-3.5 px-4 text-right">Paid (KES)</th>
                      <th className="py-3.5 px-4 text-right">Balance</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 block">{inv.institutionName}</span>
                          {inv.dueDate && (
                            <span className="text-[11px] text-slate-500">
                              Due: {new Date(inv.dueDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-xs text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-200">
                            {inv.paymentReference}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(inv.amountDue)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(inv.amountPaid)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-amber-700">
                          {formatCurrency(inv.balance)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              inv.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : inv.status === "PARTIAL"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const ch = chapters.find(c => c.id === inv.chapterId);
                                exportSingleInvoicePDF({
                                  invoiceNumber: inv.invoiceNumber || `INV-${inv.paymentReference}`,
                                  institutionName: inv.institutionName,
                                  chapterCode: ch?.code || inv.paymentReference.replace("CUCASO-", ""),
                                  paymentReference: inv.paymentReference,
                                  dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-KE") : "TBA",
                                  amountDue: inv.amountDue,
                                  amountPaid: inv.amountPaid,
                                  balance: inv.balance,
                                  status: inv.status,
                                  rallyTitle: "Annual Coastal Rally 2026",
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-200"
                              title="Download official PDF invoice"
                            >
                              <Download className="w-3.5 h-3.5 text-teal-700" /> PDF
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentForm({
                                  amount: inv.balance > 0 ? String(inv.balance) : "",
                                  reference: inv.paymentReference,
                                  method: "MPESA_C2B",
                                  payerName: inv.institutionName,
                                  payerPhone: "+254700000000",
                                });
                                setShowPaymentModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Record Payment
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CreditCard className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No payment transactions recorded</p>
              <p className="text-xs text-slate-500 mt-1">Payments received via Daraja M-Pesa C2B will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                    <th className="py-3.5 px-4">Receipt / Reference</th>
                    <th className="py-3.5 px-4">Payer</th>
                    <th className="py-3.5 px-4">Method / Channel</th>
                    <th className="py-3.5 px-4 text-right">Amount (KES)</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {pay.mpesaReceiptNumber || pay.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {pay.payerName || "Anonymous Remitter"}
                        </span>
                        {pay.payerPhone && (
                          <span className="font-mono text-[11px] text-slate-500">{pay.payerPhone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {pay.method || "MPESA_C2B"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {pay.timestamp}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            pay.status === "MATCHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-navy-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-700" />
                Record Chapter Remittance
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Chapter:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.institutionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ref Code:</span>
                <span className="font-mono font-bold text-teal-700">{selectedInvoice.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Balance:</span>
                <span className="font-bold text-amber-700">{formatCurrency(selectedInvoice.balance)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Amount Received (KES) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 25000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  M-Pesa Receipt Number or Bank Ref *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QJK8921L90 or DEP-9921"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none"
                >
                  <option value="MPESA_C2B">M-Pesa C2B Paybill</option>
                  <option value="MPESA_STK">M-Pesa STK Push</option>
                  <option value="BANK_TRANSFER">Bank Direct Deposit / EFT</option>
                  <option value="CASH">Cash Remittance (Treasury)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Payer Name</label>
                  <input
                    type="text"
                    placeholder="Chapter Treasurer"
                    value={paymentForm.payerName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Payer Phone</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={paymentForm.payerPhone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingPayment ? "Recording…" : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Council Custom Invoice Modal */}
      {showCustomInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-navy-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-700" />
                Issue Council Chapter Invoice
              </h3>
              <button
                onClick={() => setShowCustomInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomInvoice} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Chapter *
                </label>
                <select
                  value={customInvoiceForm.chapterId}
                  onChange={(e) => {
                    const chId = e.target.value;
                    const existing = invoices.find(i => i.chapterId === chId);
                    setCustomInvoiceForm(f => ({
                      ...f,
                      chapterId: chId,
                      amountDue: existing ? String(existing.amountDue) : f.amountDue,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                >
                  <option value="">-- Choose Chapter --</option>
                  {(chapters.length > 0 ? chapters : invoices).map((c: any) => (
                    <option key={c.id || c.chapterId} value={c.id || c.chapterId}>
                      {c.code ? `${c.code} - ` : ""}{c.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Council Decided Invoiced Amount (KES) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 35000"
                  value={customInvoiceForm.amountDue}
                  onChange={(e) => setCustomInvoiceForm({ ...customInvoiceForm, amountDue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Council custom quota for rally logistics and chapter capability contribution.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={customInvoiceForm.dueDate}
                  onChange={(e) => setCustomInvoiceForm({ ...customInvoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvoice}
                  className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingInvoice ? "Saving…" : "Save & Issue Invoice"}
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
