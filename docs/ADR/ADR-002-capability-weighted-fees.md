# ADR-002: Capability-Weighted Allocation Engine & Integer KES Precision

## Status
Accepted

## Context
The CUCASO constitution and PRD Section 6 dictate that rally costs are shared across chapters according to their financial capability tier rather than simple headcount or flat fees. 

In traditional software, financial calculations frequently use floating-point types (`float`, `double`, or JS `number`), leading to fractional penny/cent drift (e.g. `0.1 + 0.2 !== 0.3`). In Kenya Shillings (KES), central treasury audits require exact whole-shilling balance sheets without fractional drift. Furthermore, tier weight ratios (e.g., Tier 1 = 2.0x, Tier 2 = 1.5x, Tier 3 = 1.0x, Tier 4 = 0.5x) must be evaluated deterministically.

## Decision
1. **Pure Deterministic Calculation (`src/lib/cost-engine.ts`)**:
   - The fee calculation engine is implemented as a pure function with zero I/O or database dependencies, making it 100% testable and predictable.
2. **Integer KES Precision**:
   - All amounts in inputs, intermediate allocations, and outputs are strictly integers representing whole Kenya Shillings (`amountKes`, `finalFeeKes`, `totalBudgetKes`).
3. **Basis Points for Percentages and Weights**:
   - Contingency is represented as basis points (e.g., 1000 bp = 10.00%, 500 bp = 5.00%).
   - Capability weights are represented as basis points (Tier 1 = 200 bp / 2.0x, Tier 2 = 150 bp / 1.5x, Tier 3 = 100 bp / 1.0x, Tier 4 = 50 bp / 0.5x).
4. **Deterministic Rounding Remainder Rule (PRD §5.6 / FR-COST-09)**:
   - When dividing total rally budget by total capability weights, rounding remainders ($\Delta = \text{Total Budget} - \sum \text{Raw Fees}$) are deterministically assigned to the chapter with the highest weight ($w_{\max}$).
   - The engine logs `roundingRemainderKes` and `roundingAllocatedToChapterId` for full transparency in the audit trail.
5. **Cross-Subsidy Visibility**:
   - The engine computes both the capability fee and the raw "Cost to Serve" ($\text{Per-Head Cost} \times \text{Attendees}$). The difference ($\text{Cross-Subsidy} = \text{Fee} - \text{Cost to Serve}$) is surfaced to Council officers so larger chapters can transparently see their sponsorship of smaller colleges.

## Consequences
- No floating-point drift can occur in database columns or financial statements.
- The engine matches the worked example in PRD Section 6.4 down to 0 shillings discrepancy.
- Verified by automated unit tests in `test-cost-engine.mjs`.
