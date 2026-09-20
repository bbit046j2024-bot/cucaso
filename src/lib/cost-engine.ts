import type { CostItem, RallyChapterParticipation, BudgetSummary, FeeAdjustment } from '../types/index.ts';

export interface ChapterInput {
  id: string;
  code: string;
  name: string;
  weight: number;
  attendeeCount: number;
}

export interface CostEngineInput {
  costItems: CostItem[];
  contingencyPercent: number; // e.g., 10 for 10%
  chapters: ChapterInput[];
  adjustments?: FeeAdjustment[];
  allocationMode?: 'CAPABILITY_WEIGHTED' | 'EQUAL' | 'HEADCOUNT_WEIGHTED' | 'BASE_PLUS_PER_HEAD';
  collectedPayments?: number; // Total payments received so far
}

export function calculateRallyBudget(costItems: CostItem[], contingencyPercent: number, totalAttendees: number): BudgetSummary {
  let totalFixedCosts = 0;
  let totalPerHeadCosts = 0;
  let totalVehicleCosts = 0;

  for (const item of costItems) {
    if (item.type === 'FIXED') {
      totalFixedCosts += item.amount;
    } else if (item.type === 'PER_HEAD') {
      totalPerHeadCosts += item.amount * totalAttendees;
    } else if (item.type === 'PER_VEHICLE') {
      const qty = item.quantity || 1;
      totalVehicleCosts += item.amount * qty;
    }
  }

  const subtotal = totalFixedCosts + totalPerHeadCosts + totalVehicleCosts;
  const contingencyAmount = subtotal * (contingencyPercent / 100);
  const totalBudget = Math.round(subtotal + contingencyAmount);
  const perHeadCostToServe = totalAttendees > 0 ? Math.round(totalBudget / totalAttendees) : 0;

  return {
    totalFixedCosts,
    totalPerHeadCosts,
    totalVehicleCosts,
    subtotal,
    contingencyAmount,
    totalBudget,
    totalAttendees,
    perHeadCostToServe,
    sufficiencyStatus: 'ON_TRACK',
    collectedAmount: 0,
    outstandingAmount: totalBudget,
    fundingGap: 0,
  };
}

export function calculateCapabilityFees(input: CostEngineInput): {
  summary: BudgetSummary;
  chapterFees: RallyChapterParticipation[];
} {
  const totalAttendees = input.chapters.reduce((sum, ch) => sum + ch.attendeeCount, 0);
  const summary = calculateRallyBudget(input.costItems, input.contingencyPercent, totalAttendees);
  const mode = input.allocationMode || 'CAPABILITY_WEIGHTED';

  const collected = input.collectedPayments || 0;
  summary.collectedAmount = collected;
  summary.outstandingAmount = Math.max(0, summary.totalBudget - collected);
  summary.fundingGap = Math.max(0, summary.totalBudget - collected);
  if (collected >= summary.totalBudget) {
    summary.sufficiencyStatus = 'FUNDED';
  } else if (collected < summary.totalBudget * 0.5) {
    summary.sufficiencyStatus = 'SHORTFALL';
  } else {
    summary.sufficiencyStatus = 'ON_TRACK';
  }

  const totalWeight = input.chapters.reduce((sum, ch) => sum + ch.weight, 0);
  const numChapters = input.chapters.length;

  let rawFees: { chapterId: string; fee: number; weight: number; attendeeCount: number }[] = [];

  if (mode === 'CAPABILITY_WEIGHTED') {
    rawFees = input.chapters.map(ch => {
      const share = totalWeight > 0 ? ch.weight / totalWeight : 1 / numChapters;
      const fee = Math.round(summary.totalBudget * share);
      return { chapterId: ch.id, fee, weight: ch.weight, attendeeCount: ch.attendeeCount };
    });
  } else if (mode === 'EQUAL') {
    const feePerChapter = Math.round(summary.totalBudget / (numChapters || 1));
    rawFees = input.chapters.map(ch => ({
      chapterId: ch.id,
      fee: feePerChapter,
      weight: ch.weight,
      attendeeCount: ch.attendeeCount,
    }));
  } else if (mode === 'HEADCOUNT_WEIGHTED') {
    rawFees = input.chapters.map(ch => {
      const share = totalAttendees > 0 ? ch.attendeeCount / totalAttendees : 1 / numChapters;
      const fee = Math.round(summary.totalBudget * share);
      return { chapterId: ch.id, fee, weight: ch.weight, attendeeCount: ch.attendeeCount };
    });
  } else {
    // BASE_PLUS_PER_HEAD
    const baseFee = Math.round((summary.totalBudget * 0.3) / (numChapters || 1));
    const variableBudget = summary.totalBudget * 0.7;
    rawFees = input.chapters.map(ch => {
      const variableShare = totalAttendees > 0 ? (ch.attendeeCount / totalAttendees) * variableBudget : 0;
      const fee = Math.round(baseFee + variableShare);
      return { chapterId: ch.id, fee, weight: ch.weight, attendeeCount: ch.attendeeCount };
    });
  }

  // Handle rounding remainder adjustment (assign to highest-weight chapter)
  const feeSum = rawFees.reduce((sum, item) => sum + item.fee, 0);
  const remainder = summary.totalBudget - feeSum;
  if (remainder !== 0 && rawFees.length > 0) {
    // find highest weight chapter
    let maxIdx = 0;
    for (let i = 1; i < rawFees.length; i++) {
      if (rawFees[i].weight > rawFees[maxIdx].weight) {
        maxIdx = i;
      }
    }
    rawFees[maxIdx].fee += remainder;
  }

  // Process adjustments if any
  const finalChapterFees: RallyChapterParticipation[] = rawFees.map(rf => {
    const costToServe = Math.round(summary.perHeadCostToServe * rf.attendeeCount);
    let fee = rf.fee;

    // Check if there is an adjustment for this chapter
    const adjustment = input.adjustments?.find(a => a.chapterId === rf.chapterId);
    if (adjustment) {
      if (adjustment.type === 'FULL_WAIVER') {
        fee = 0;
      } else if (adjustment.type === 'FIXED_FEE') {
        fee = adjustment.amount;
      } else if (adjustment.type === 'PARTIAL_SUBSIDY') {
        fee = Math.max(0, fee - adjustment.amount);
      }
    }

    const crossSubsidy = fee - costToServe;

    return {
      rallyId: '',
      chapterId: rf.chapterId,
      weightSnapshot: rf.weight,
      attendeeCount: rf.attendeeCount,
      calculatedFee: fee,
      costToServe,
      crossSubsidy,
    };
  });

  return { summary, chapterFees: finalChapterFees };
}
