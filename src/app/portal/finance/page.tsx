"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DollarSign, Lock, Receipt, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinancePortalPage() {
  const [feeLocked, setFeeLocked] = useState(false);
  const [invoices, setInvoices] = useState([
    {
      id: "inv-1",
      chapterCode: "TUM-01",
      chapterName: "Technical University of Mombasa",
      tier: "Tier 1 (2.0x)",
      attendees: 150,
      amountDue: 220000,
      amountPaid: 220000,
      balance: 0,
      paymentRef: "TUM-01-CUR2026",
      status: "PAID",
      method: "MPESA_DARAJA",
      mpesaReceipt: "QJK8921L90",
    },
    {
      id: "inv-2",
      chapterCode: "PWANI-01",
      chapterName: "Pwani University",
      tier: "Tier 2 (1.5x)",
      attendees: 120,
      amountDue: 165000,
      amountPaid: 100000,
      balance: 65000,
      paymentRef: "PWANI-01-CUR2026",
      status: "PARTIAL",
      method: "BANK_TRANSFER",
      mpesaReceipt: "N/A (Bank Deposit)",
    },
    {
      id: "inv-3",
      chapterCode: "MPOLY-01",
      chapterName: "Mombasa Polytechnic College",
      tier: "Tier 3 (1.0x)",
      attendees: 100,
      amountDue: 110000,
      amountPaid: 0,
      balance: 110000,
      paymentRef: "MPOLY-01-CUR2026",
      status: "UNPAID",
      method: "NONE",
      mpesaReceipt: "Pending",
    },
  ]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const outstandingBalance = totalInvoiced - totalCollected;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFeeLocked(!feeLocked)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors ${
                feeLocked
                  ? "bg-rose-700 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-navy-950"
              }`}
            >
              <Lock className="w-4 h-4" />
              {feeLocked ? "Fee Lock Frozen (Locked)" : "Freeze Rally Fee Lock"}
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
            <span className="text-xs text-slate-500 mt-2 block">Calculated via Capability Fee Engine</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-bold block">Collected Payments</span>
            <span className="font-heading font-black text-3xl text-emerald-600 mt-1 block">
              {formatCurrency(totalCollected)}
            </span>
            <span className="text-xs text-emerald-700 font-bold mt-2 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> M-Pesa C2B & Bank Statements
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 uppercase font-bold block">Outstanding Balance</span>
            <span className="font-heading font-black text-3xl text-amber-600 mt-1 block">
              {formatCurrency(outstandingBalance)}
            </span>
            <span className="text-xs text-amber-700 font-bold mt-2 block">Due Date: 10 November 2026</span>
          </div>
        </div>

        {/* Invoice Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-600" />
              Chapter Invoices & Remittance Receipts (FR-COST-07)
            </h3>
            <span className="text-xs font-bold text-slate-500">M-Pesa Paybill #4089201</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                <th className="py-3.5 px-4">Chapter & Ref</th>
                <th className="py-3.5 px-4">Tier & Attendees</th>
                <th className="py-3.5 px-4 text-right">Amount Invoiced</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Balance</th>
                <th className="py-3.5 px-4">M-Pesa / Receipt Ref</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{inv.chapterName}</span>
                    <span className="font-mono text-xs text-teal-700 font-bold">{inv.paymentRef}</span>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="font-bold block text-slate-800">{inv.tier}</span>
                    <span className="text-slate-500">{inv.attendees} Registered Attendees</span>
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
                  <td className="py-4 px-4 font-mono text-xs text-slate-700">
                    {inv.mpesaReceipt}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
