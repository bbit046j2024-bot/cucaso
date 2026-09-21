/**
 * CUCASO Cost Engine — PRD Section 6
 * 
 * PURE DETERMINISTIC FUNCTION. No side effects. No DB calls.
 * All monetary amounts are INTEGER KES (no floats).
 * Tier weights are passed as integer basis points (200 = 2.0x, 150 = 1.5x).
 * 
 * ROUNDING RULE (PRD §5.6 FR-COST-09):
 *   Fees are rounded to whole shillings (integers).
 *   Any remainder from rounding (Total Budget - Sum of raw fees) is
 *   allocated to the chapter with the highest weight and logged.
 * 
 * PRD §6.4 WORKED EXAMPLE VERIFICATION:
 *   Budget KES 660,000; Weights 2.0, 1.5, 1.0, 1.0, 0.5; Total Weight 6.0
 *   Fees: 220,000 / 165,000 / 110,000 / 110,000 / 55,000 — Sum = 660,000 exactly.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CostItemInput {
  id: string;
  category: string;
  type: "FIXED" | "PER_HEAD" | "PER_VEHICLE";
  amountKes: number;  // integer KES
  quantity?: number;
}

export interface ChapterInput {
  id: string;
  code: string;
  name: string;
  weightBasisPoints: number;  // e.g. 200 for 2.0x, 150 for 1.5x
  attendeeCount: number;
}

export interface FeeAdjustmentInput {
  chapterId: string;
  type: "FULL_WAIVER" | "FIXED_FEE" | "PARTIAL_SUBSIDY";
  amountKes: number;
  fundingTreatment: "REDISTRIBUTED" | "EXTERNAL_SPONSOR";
}

export interface CostEngineInput {
  costItems: CostItemInput[];
  contingencyBasisPoints: number;  // e.g. 1000 = 10%, 500 = 5%
  chapters: ChapterInput[];
  adjustments?: FeeAdjustmentInput[];
  allocationMode?: "CAPABILITY_WEIGHTED" | "EQUAL" | "HEADCOUNT_WEIGHTED" | "BASE_PLUS_PER_HEAD";
  collectedPaymentsKes?: number;
}

export interface ChapterFeeResult {
  chapterId: string;
  code: string;
  name: string;
  weightBasisPoints: number;
  attendeeCount: number;
  rawFeeKes: number;       // Before adjustments
  adjustmentKes: number;   // Negative = waiver/subsidy, Positive = surcharge
  finalFeeKes: number;     // After adjustments (what chapter owes)
  costToServeKes: number;  // Budget's share of serving this chapter's attendees
  crossSubsidyKes: number; // finalFeeKes - costToServeKes (positive = supports others)
  roundingAdjustment: number; // KES added/removed for rounding reconciliation
}

export interface BudgetSummary {
  totalFixedCostsKes: number;
  totalPerHeadCostsKes: number;
  totalVehicleCostsKes: number;
  subtotalKes: number;
  contingencyKes: number;
  totalBudgetKes: number;        // Integer KES - the authoritative budget
  totalAttendees: number;
  perHeadCostToServeKes: number; // Budget / total attendees (rounded)
  totalInvoicedKes: number;      // Sum of all chapter finalFeeKes
  collectedKes: number;
  outstandingKes: number;
  sufficiencyStatus: "FUNDED" | "ON_TRACK" | "SHORTFALL";
  fundingGapKes: number;
}

export interface CostEngineOutput {
  summary: BudgetSummary;
  chapterFees: ChapterFeeResult[];
  roundingRemainderKes: number; // The remainder allocated to highest-weight chapter
  roundingAllocatedToChapterId: string;
}

// ─── Budget Calculation ───────────────────────────────────────────────────────

export function calculateBudget(
  costItems: CostItemInput[],
  contingencyBasisPoints: number,
  totalAttendees: number
): Pick<BudgetSummary, "totalFixedCostsKes" | "totalPerHeadCostsKes" | "totalVehicleCostsKes" | "subtotalKes" | "contingencyKes" | "totalBudgetKes"> {
  let totalFixedCostsKes = 0;
  let totalPerHeadCostsKes = 0;
  let totalVehicleCostsKes = 0;

  for (const item of costItems) {
    const qty = item.quantity ?? 1;
    if (item.type === "FIXED") {
      totalFixedCostsKes += item.amountKes;
    } else if (item.type === "PER_HEAD") {
      totalPerHeadCostsKes += item.amountKes * totalAttendees;
    } else if (item.type === "PER_VEHICLE") {
      totalVehicleCostsKes += item.amountKes * qty;
    }
  }

  const subtotalKes = totalFixedCostsKes + totalPerHeadCostsKes + totalVehicleCostsKes;
  // Integer multiplication then integer division — no float involved
  const contingencyKes = Math.round((subtotalKes * contingencyBasisPoints) / 10000);
  const totalBudgetKes = subtotalKes + contingencyKes;

  return {
    totalFixedCostsKes,
    totalPerHeadCostsKes,
    totalVehicleCostsKes,
    subtotalKes,
    contingencyKes,
    totalBudgetKes,
  };
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export function calculateCapabilityFees(input: CostEngineInput): CostEngineOutput {
  const {
    costItems,
    contingencyBasisPoints,
    chapters,
    adjustments = [],
    allocationMode = "CAPABILITY_WEIGHTED",
    collectedPaymentsKes = 0,
  } = input;

  if (chapters.length === 0) {
    throw new Error("Cost engine requires at least one chapter");
  }

  const totalAttendees = chapters.reduce((s, c) => s + c.attendeeCount, 0);
  const budgetParts = calculateBudget(costItems, contingencyBasisPoints, totalAttendees);
  const { totalBudgetKes } = budgetParts;

  const numChapters = chapters.length;
  const totalWeightBasisPoints = chapters.reduce((s, c) => s + c.weightBasisPoints, 0);

  // ── Step 1: Calculate raw (pre-rounding) fees per chapter ──────────────────
  let rawFees: Array<{ chapterId: string; feeKes: number; weightBasisPoints: number; attendeeCount: number }> = [];

  if (allocationMode === "CAPABILITY_WEIGHTED") {
    rawFees = chapters.map((ch) => {
      const share = totalWeightBasisPoints > 0
        ? ch.weightBasisPoints / totalWeightBasisPoints
        : 1 / numChapters;
      return {
        chapterId: ch.id,
        feeKes: Math.round(totalBudgetKes * share),
        weightBasisPoints: ch.weightBasisPoints,
        attendeeCount: ch.attendeeCount,
      };
    });

  } else if (allocationMode === "EQUAL") {
    const feePerChapter = Math.round(totalBudgetKes / numChapters);
    rawFees = chapters.map((ch) => ({
      chapterId: ch.id,
      feeKes: feePerChapter,
      weightBasisPoints: ch.weightBasisPoints,
      attendeeCount: ch.attendeeCount,
    }));

  } else if (allocationMode === "HEADCOUNT_WEIGHTED") {
    rawFees = chapters.map((ch) => {
      const share = totalAttendees > 0
        ? ch.attendeeCount / totalAttendees
        : 1 / numChapters;
      return {
        chapterId: ch.id,
        feeKes: Math.round(totalBudgetKes * share),
        weightBasisPoints: ch.weightBasisPoints,
        attendeeCount: ch.attendeeCount,
      };
    });

  } else {
    // BASE_PLUS_PER_HEAD: 30% shared equally, 70% by headcount
    const baseBudgetKes = Math.round(totalBudgetKes * 0.3);
    const variableBudgetKes = totalBudgetKes - baseBudgetKes;
    const baseFeeKes = Math.round(baseBudgetKes / numChapters);
    rawFees = chapters.map((ch) => {
      const variableShare = totalAttendees > 0
        ? ch.attendeeCount / totalAttendees
        : 1 / numChapters;
      return {
        chapterId: ch.id,
        feeKes: Math.round(baseFeeKes + variableBudgetKes * variableShare),
        weightBasisPoints: ch.weightBasisPoints,
        attendeeCount: ch.attendeeCount,
      };
    });
  }

  // ── Step 2: Rounding reconciliation (PRD FR-COST-09) ─────────────────────
  const feeSum = rawFees.reduce((s, r) => s + r.feeKes, 0);
  const remainder = totalBudgetKes - feeSum;
  
  // Allocate remainder to the highest-weight chapter
  let maxWeightIdx = 0;
  for (let i = 1; i < rawFees.length; i++) {
    if (rawFees[i].weightBasisPoints > rawFees[maxWeightIdx].weightBasisPoints) {
      maxWeightIdx = i;
    }
  }
  rawFees[maxWeightIdx].feeKes += remainder;
  const roundingAllocatedToChapterId = rawFees[maxWeightIdx].chapterId;

  // ── Step 3: Apply fee adjustments ────────────────────────────────────────
  // Build a map of chapter adjustments
  const adjMap = new Map<string, FeeAdjustmentInput>();
  for (const adj of adjustments) {
    adjMap.set(adj.chapterId, adj);
  }

  // ── Step 4: Build final results ───────────────────────────────────────────
  const perHeadCostToServeKes = totalAttendees > 0
    ? Math.round(totalBudgetKes / totalAttendees)
    : 0;

  let totalInvoicedKes = 0;

  const chapterFees: ChapterFeeResult[] = rawFees.map((rf, idx) => {
    const ch = chapters.find((c) => c.id === rf.chapterId)!;
    const rawFeeKes = rf.feeKes;
    const adj = adjMap.get(rf.chapterId);
    
    let finalFeeKes = rawFeeKes;
    let adjustmentKes = 0;

    if (adj) {
      if (adj.type === "FULL_WAIVER") {
        finalFeeKes = 0;
        adjustmentKes = -rawFeeKes;
      } else if (adj.type === "FIXED_FEE") {
        adjustmentKes = adj.amountKes - rawFeeKes;
        finalFeeKes = adj.amountKes;
      } else if (adj.type === "PARTIAL_SUBSIDY") {
        adjustmentKes = -Math.min(adj.amountKes, rawFeeKes);
        finalFeeKes = Math.max(0, rawFeeKes - adj.amountKes);
      }
    }

    const costToServeKes = perHeadCostToServeKes * ch.attendeeCount;
    const crossSubsidyKes = finalFeeKes - costToServeKes;
    const roundingAdjustment = idx === maxWeightIdx ? remainder : 0;

    totalInvoicedKes += finalFeeKes;

    return {
      chapterId: ch.id,
      code: ch.code,
      name: ch.name,
      weightBasisPoints: ch.weightBasisPoints,
      attendeeCount: ch.attendeeCount,
      rawFeeKes,
      adjustmentKes,
      finalFeeKes,
      costToServeKes,
      crossSubsidyKes,
      roundingAdjustment,
    };
  });

  // ── Step 5: Sufficiency check (PRD §6.3) ─────────────────────────────────
  let sufficiencyStatus: BudgetSummary["sufficiencyStatus"];
  const outstandingKes = Math.max(0, totalBudgetKes - collectedPaymentsKes);
  const fundingGapKes = Math.max(0, totalBudgetKes - collectedPaymentsKes);

  if (collectedPaymentsKes >= totalBudgetKes) {
    sufficiencyStatus = "FUNDED";
  } else if (collectedPaymentsKes >= totalBudgetKes * 0.5) {
    sufficiencyStatus = "ON_TRACK";
  } else {
    sufficiencyStatus = "SHORTFALL";
  }

  const summary: BudgetSummary = {
    ...budgetParts,
    totalAttendees,
    perHeadCostToServeKes,
    totalInvoicedKes,
    collectedKes: collectedPaymentsKes,
    outstandingKes,
    sufficiencyStatus,
    fundingGapKes,
  };

  return {
    summary,
    chapterFees,
    roundingRemainderKes: remainder,
    roundingAllocatedToChapterId,
  };
}

// ─── Legacy Bridge (backward compat for existing code using Float amounts) ────
// The old CostItem type used `amount: Float`. This adapter converts to integer KES.

export function adaptLegacyCostItem(item: {
  id: string;
  rallyId?: string;
  category: string;
  name?: string;
  type: string;
  amount: number;  // old Float field
  quantity?: number;
}): CostItemInput {
  return {
    id: item.id,
    category: item.category,
    type: item.type as CostItemInput["type"],
    amountKes: Math.round(item.amount),  // Convert float to nearest integer KES
    quantity: item.quantity,
  };
}
