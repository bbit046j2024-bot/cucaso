import { calculateCapabilityFees } from "./src/lib/cost-engine.ts";

// Cost items from PRD Section 6.4
const costItems = [
  { id: "1", rallyId: "test", category: "VENUE", name: "Venue Fixed", type: "FIXED", amount: 200000 },
  { id: "2", rallyId: "test", category: "CATERING", name: "Per Head Meals", type: "PER_HEAD", amount: 800 },
];

const chapters = [
  { id: "ch-a", code: "CHA", name: "Chapter A", weight: 2.0, attendeeCount: 150 },
  { id: "ch-b", code: "CHB", name: "Chapter B", weight: 1.5, attendeeCount: 120 },
  { id: "ch-c", code: "CHC", name: "Chapter C", weight: 1.0, attendeeCount: 100 },
  { id: "ch-d", code: "CHD", name: "Chapter D", weight: 1.0, attendeeCount: 80 },
  { id: "ch-e", code: "CHE", name: "Chapter E", weight: 0.5, attendeeCount: 50 },
];

const result = calculateCapabilityFees({
  costItems,
  contingencyPercent: 10,
  chapters,
  allocationMode: "CAPABILITY_WEIGHTED",
});

console.log("==========================================");
console.log("CUCASO PRD SECTION 6.4 TEST VERIFICATION");
console.log("==========================================");
console.log(`Total Budget Expected: KES 660,000 | Actual: KES ${result.summary.totalBudget.toLocaleString()}`);
console.log("------------------------------------------");

const expected = [
  { code: "CHA", fee: 220000, serve: 198000, sub: 22000 },
  { code: "CHB", fee: 165000, serve: 158400, sub: 6600 },
  { code: "CHC", fee: 110000, serve: 132000, sub: -22000 },
  { code: "CHD", fee: 110000, serve: 105600, sub: 4400 },
  { code: "CHE", fee: 55000, serve: 66000, sub: -11000 },
];

let allPassed = true;
if (result.summary.totalBudget !== 660000) allPassed = false;

result.chapterFees.forEach((cf, idx) => {
  const exp = expected[idx];
  const pass = cf.calculatedFee === exp.fee && cf.costToServe === exp.serve && cf.crossSubsidy === exp.sub;
  if (!pass) allPassed = false;
  console.log(`Chapter ${exp.code}: Fee=${cf.calculatedFee} (exp ${exp.fee}) | Serve=${cf.costToServe} (exp ${exp.serve}) | Sub=${cf.crossSubsidy} (exp ${exp.sub}) | Status: ${pass ? 'PASS' : 'FAIL'}`);
});

console.log("------------------------------------------");
console.log(`OVERALL COST ENGINE VERIFICATION: ${allPassed ? "PASSED 100%" : "FAILED"}`);
console.log("==========================================");
