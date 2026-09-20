"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { calculateCapabilityFees } from "@/lib/cost-engine";
import { CostItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function CostCalculatorSimulator() {
  const [fixedCosts, setFixedCosts] = useState<number>(200000);
  const [perHeadRate, setPerHeadRate] = useState<number>(800);
  const [contingency, setContingency] = useState<number>(10);

  // Sample chapters from PRD section 6.4
  const [chapters, setChapters] = useState([
    { id: "ch-a", code: "TUM", name: "Chapter A (Tier 1)", weight: 2.0, attendeeCount: 150 },
    { id: "ch-b", code: "PWANI", name: "Chapter B (Tier 2)", weight: 1.5, attendeeCount: 120 },
    { id: "ch-c", code: "MPOLY", name: "Chapter C (Tier 3)", weight: 1.0, attendeeCount: 100 },
    { id: "ch-d", code: "KMTC", name: "Chapter D (Tier 3)", weight: 1.0, attendeeCount: 80 },
    { id: "ch-e", code: "COAST", name: "Chapter E (Tier 4)", weight: 0.5, attendeeCount: 50 },
  ]);

  const costItems: CostItem[] = [
    { id: "1", rallyId: "sim", category: "VENUE", name: "Venue & Equipment", type: "FIXED", amount: fixedCosts },
    { id: "2", rallyId: "sim", category: "CATERING", name: "Meals & Refreshments", type: "PER_HEAD", amount: perHeadRate },
  ];

  const { summary, chapterFees } = calculateCapabilityFees({
    costItems,
    contingencyPercent: contingency,
    chapters,
    allocationMode: "CAPABILITY_WEIGHTED",
  });

  const handleAttendeeChange = (index: number, val: number) => {
    const updated = [...chapters];
    updated[index].attendeeCount = Math.max(0, val);
    setChapters(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            PRD Section 6 Algorithm
          </span>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900">
            Capability Fee Engine Simulator
          </h3>
          <p className="text-sm text-slate-600">
            Simulate rally budget calculations and capability-weighted fee allocations across chapters.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right">
          <span className="text-xs text-slate-500 block uppercase font-semibold">Total Budget</span>
          <span className="font-heading font-black text-2xl text-navy-900">
            {formatCurrency(summary.totalBudget)}
          </span>
        </div>
      </div>

      {/* Simulator Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Fixed Venue & Logistics (KES)
          </label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Per-Head Catering Rate (KES)
          </label>
          <input
            type="number"
            value={perHeadRate}
            onChange={(e) => setPerHeadRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Contingency Margin (%)
          </label>
          <input
            type="number"
            value={contingency}
            onChange={(e) => setContingency(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Chapter Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
              <th className="py-3 px-4">Chapter</th>
              <th className="py-3 px-4 text-center">Tier / Weight</th>
              <th className="py-3 px-4 text-center">Attendees</th>
              <th className="py-3 px-4 text-right">Calculated Fee</th>
              <th className="py-3 px-4 text-right">Cost to Serve</th>
              <th className="py-3 px-4 text-right">Cross-Subsidy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {chapterFees.map((cf, idx) => {
              const ch = chapters[idx];
              const isPositive = cf.crossSubsidy >= 0;
              return (
                <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {ch.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    <span className="px-2 py-1 rounded bg-slate-200 font-bold text-xs">
                      {ch.weight.toFixed(1)}x
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      value={ch.attendeeCount}
                      onChange={(e) => handleAttendeeChange(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-navy-900">
                    {formatCurrency(cf.calculatedFee)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                    {formatCurrency(cf.costToServe)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                        isPositive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(cf.crossSubsidy)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold text-sm">
              <td className="py-3.5 px-4">Total</td>
              <td className="py-3.5 px-4 text-center">
                {chapters.reduce((s, c) => s + c.weight, 0).toFixed(1)}x
              </td>
              <td className="py-3.5 px-4 text-center font-bold">
                {summary.totalAttendees}
              </td>
              <td className="py-3.5 px-4 text-right text-amber-400 font-bold">
                {formatCurrency(summary.totalBudget)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">
                {formatCurrency(summary.totalBudget)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">KES 0</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 flex items-center gap-2">
        <Info className="w-4 h-4 text-teal-700 flex-shrink-0" />
        <div>
          <strong>Note on Cross-Subsidy:</strong> Positive values indicate higher-capability chapters supporting the general rally budget. Negative values indicate supported chapters receiving a capability concession.
        </div>
      </div>
    </div>
  );
}
