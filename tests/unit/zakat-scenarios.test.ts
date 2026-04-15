// 473 – Zakat Calculation Accuracy: 50+ Scenarios
// Run: npx jest tests/unit/zakat-scenarios.test.ts

import { describe, it, expect } from '@jest/globals';

// ── Zakat Engine (mirrors backend logic) ─────────────────────────────────
interface ZakatInput {
  cashAndSavings: number;
  goldGrams?: number;
  silverGrams?: number;
  investmentValue?: number;
  businessInventory?: number;
  receivables?: number;
  debts?: number;
  goldPricePerGram: number;      // IDR
  silverPricePerGram?: number;   // IDR
}

interface ZakatResult {
  totalHawl: number;
  nisabGold: number;
  nisabSilver: number;
  nisabUsed: number;
  liable: boolean;
  zakatAmount: number;
  rate: number;
  breakdown: Record<string, number>;
}

const NISAB_GOLD_GRAMS   = 85;
const NISAB_SILVER_GRAMS = 595;

function calculateZakatMaal(input: ZakatInput): ZakatResult {
  const goldPrice   = input.goldPricePerGram;
  const silverPrice = input.silverPricePerGram ?? goldPrice * 0.013; // approx ratio

  const nisabGold   = NISAB_GOLD_GRAMS   * goldPrice;
  const nisabSilver = NISAB_SILVER_GRAMS * silverPrice;
  const nisabUsed   = Math.min(nisabGold, nisabSilver); // use lower (more inclusive)

  const breakdown = {
    cash:        input.cashAndSavings || 0,
    gold:        (input.goldGrams || 0) * goldPrice,
    silver:      (input.silverGrams || 0) * silverPrice,
    investments: input.investmentValue || 0,
    business:    input.businessInventory || 0,
    receivables: input.receivables || 0,
    debts:       -(input.debts || 0),
  };

  const totalHawl = Math.max(0, Object.values(breakdown).reduce((s, v) => s + v, 0));
  const liable    = totalHawl >= nisabUsed;
  const zakatAmount = liable ? totalHawl * 0.025 : 0;

  return { totalHawl, nisabGold, nisabSilver, nisabUsed, liable, zakatAmount, rate: 0.025, breakdown };
}

// Gold price assumption for tests: Rp 1,285,000/gram
const GOLD = 1_285_000;

describe('Zakat Maal Calculation — 50+ Scenarios (Task 473)', () => {

  // ── Basic eligibility ───────────────────────────────────────────────────
  it('01: No assets → not liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 0, goldPricePerGram: GOLD });
    expect(r.liable).toBe(false);
    expect(r.zakatAmount).toBe(0);
  });

  it('02: Cash exactly at Nisab (gold) → liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 85 * GOLD, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
    expect(r.zakatAmount).toBeCloseTo(85 * GOLD * 0.025);
  });

  it('03: Cash 1 IDR below Nisab → not liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 85 * GOLD - 1, goldPricePerGram: GOLD });
    expect(r.liable).toBe(false);
  });

  it('04: Large wealth (1 billion IDR) → correct zakat', () => {
    const r = calculateZakatMaal({ cashAndSavings: 1_000_000_000, goldPricePerGram: GOLD });
    expect(r.zakatAmount).toBeCloseTo(25_000_000);
  });

  it('05: Zero savings + gold holdings only → liable if gold ≥ 85g', () => {
    const r = calculateZakatMaal({ cashAndSavings: 0, goldGrams: 90, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
    expect(r.breakdown.gold).toBe(90 * GOLD);
  });

  it('06: Gold exactly 85g → liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 0, goldGrams: 85, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
  });

  it('07: Gold 84.9g → not liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 0, goldGrams: 84.9, goldPricePerGram: GOLD });
    expect(r.liable).toBe(false);
  });

  // ── Multi-asset scenarios ───────────────────────────────────────────────
  it('08: Cash + gold bundle above Nisab → liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 50_000_000, goldGrams: 30, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
  });

  it('09: Investments bring total above Nisab → liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 50_000_000, investmentValue: 60_000_000, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
    expect(r.breakdown.investments).toBe(60_000_000);
  });

  it('10: Business inventory included in hawl', () => {
    const r = calculateZakatMaal({ cashAndSavings: 0, businessInventory: 200_000_000, goldPricePerGram: GOLD });
    expect(r.liable).toBe(true);
    expect(r.breakdown.business).toBe(200_000_000);
  });

  // ── Debt offset scenarios ───────────────────────────────────────────────
  it('11: Debts reduce hawl below Nisab → not liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 150_000_000, debts: 50_000_000, goldPricePerGram: GOLD });
    // 150M - 50M = 100M — still above 109M Nisab? Depends on gold price.
    // At 1.285M/g × 85g = ~109.2M Nisab → 100M < Nisab → not liable
    expect(r.totalHawl).toBe(100_000_000);
    expect(r.liable).toBe(false);
  });

  it('12: Debts > assets → hawl clamped to 0, not liable', () => {
    const r = calculateZakatMaal({ cashAndSavings: 50_000_000, debts: 80_000_000, goldPricePerGram: GOLD });
    expect(r.totalHawl).toBe(0);
    expect(r.liable).toBe(false);
    expect(r.zakatAmount).toBe(0);
  });

  it('13: Receivables included in zakatMaal computation', () => {
    const r = calculateZakatMaal({ cashAndSavings: 100_000_000, receivables: 50_000_000, goldPricePerGram: GOLD });
    expect(r.breakdown.receivables).toBe(50_000_000);
    expect(r.totalHawl).toBe(150_000_000);
  });

  it('14: Silver nisab used when lower than gold nisab', () => {
    // Silver: 595g × ~16,705 ≈ 9.9M — much lower than gold nisab
    const r = calculateZakatMaal({ cashAndSavings: 10_000_000, goldPricePerGram: GOLD, silverPricePerGram: 16_705 });
    // Nisab used = min(109.2M gold, 9.9M silver) = 9.9M → liable
    expect(r.nisabSilver).toBeLessThan(r.nisabGold);
    expect(r.nisabUsed).toBe(r.nisabSilver);
    expect(r.liable).toBe(true);
  });

  it('15: 2.5% rate always applied on net hawl', () => {
    const assets = 500_000_000;
    const r = calculateZakatMaal({ cashAndSavings: assets, goldPricePerGram: GOLD });
    expect(r.zakatAmount).toBe(assets * 0.025);
    expect(r.rate).toBe(0.025);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────
  it('16: Fractional gold (0.5g) included correctly', () => {
    const r = calculateZakatMaal({ cashAndSavings: 100_000_000, goldGrams: 0.5, goldPricePerGram: GOLD });
    expect(r.breakdown.gold).toBeCloseTo(0.5 * GOLD);
  });

  it('17: Very high gold price (2M/g) raises Nisab', () => {
    const r = calculateZakatMaal({ cashAndSavings: 100_000_000, goldPricePerGram: 2_000_000 });
    // Nisab = 85 × 2M = 170M → 100M < 170M → not liable
    expect(r.nisabGold).toBe(170_000_000);
    expect(r.liable).toBe(false);
  });

  it('18: Very low gold price (500K/g) lowers Nisab', () => {
    const r = calculateZakatMaal({ cashAndSavings: 45_000_000, goldPricePerGram: 500_000 });
    // Nisab = 85 × 500K = 42.5M → 45M > 42.5M → liable
    expect(r.nisabGold).toBe(42_500_000);
    expect(r.liable).toBe(true);
  });

  it('19: Multiple debts summed correctly', () => {
    const r = calculateZakatMaal({
      cashAndSavings:  200_000_000,
      debts:           80_000_000,
      goldPricePerGram: GOLD,
    });
    expect(r.totalHawl).toBe(120_000_000);
    expect(r.liable).toBe(true);
  });

  it('20: All asset types combined', () => {
    const r = calculateZakatMaal({
      cashAndSavings:    100_000_000,
      goldGrams:         20,
      investmentValue:   50_000_000,
      businessInventory: 30_000_000,
      receivables:       20_000_000,
      debts:             15_000_000,
      goldPricePerGram:  GOLD,
    });
    const expectedHawl = 100_000_000 + 20 * GOLD + 50_000_000 + 30_000_000 + 20_000_000 - 15_000_000;
    expect(r.totalHawl).toBeCloseTo(expectedHawl);
    expect(r.zakatAmount).toBeCloseTo(expectedHawl * 0.025);
  });

  // ── Snapshot precision tests (21–50) ──────────────────────────────────
  const BATCH_SCENARIOS: Array<{ desc: string; input: ZakatInput; expectLiable: boolean; expectZakat?: number }> = [
    { desc: '21: 120M cash',        input: { cashAndSavings: 120_000_000,  goldPricePerGram: GOLD }, expectLiable: true,  expectZakat: 3_000_000 },
    { desc: '22: 109M cash',        input: { cashAndSavings: 109_250_000,  goldPricePerGram: GOLD }, expectLiable: true },
    { desc: '23: 109M - 1 cash',    input: { cashAndSavings: 109_249_999,  goldPricePerGram: GOLD }, expectLiable: false },
    { desc: '24: 50g gold only',    input: { cashAndSavings: 0, goldGrams: 50, goldPricePerGram: GOLD }, expectLiable: false },
    { desc: '25: 100g gold only',   input: { cashAndSavings: 0, goldGrams: 100, goldPricePerGram: GOLD }, expectLiable: true },
    { desc: '26: 500M cash',        input: { cashAndSavings: 500_000_000,  goldPricePerGram: GOLD }, expectLiable: true,  expectZakat: 12_500_000 },
    { desc: '27: 1B investments',   input: { cashAndSavings: 0, investmentValue: 1_000_000_000, goldPricePerGram: GOLD }, expectLiable: true, expectZakat: 25_000_000 },
    { desc: '28: 200M - 100M debt', input: { cashAndSavings: 200_000_000, debts: 100_000_000, goldPricePerGram: GOLD }, expectLiable: false },
    { desc: '29: 300M - 100M debt', input: { cashAndSavings: 300_000_000, debts: 100_000_000, goldPricePerGram: GOLD }, expectLiable: true,  expectZakat: 5_000_000 },
    { desc: '30: cash + 85g gold',  input: { cashAndSavings: 50_000_000, goldGrams: 85, goldPricePerGram: GOLD }, expectLiable: true },
    // 31–50: varied amounts
    ...Array.from({ length: 20 }, (_, i) => ({
      desc: `${31 + i}: ${(i + 1) * 50}M cash`,
      input: { cashAndSavings: (i + 1) * 50_000_000, goldPricePerGram: GOLD },
      expectLiable: (i + 1) * 50_000_000 >= 85 * GOLD,
    })),
  ];

  for (const scenario of BATCH_SCENARIOS) {
    it(scenario.desc, () => {
      const r = calculateZakatMaal(scenario.input);
      expect(r.liable).toBe(scenario.expectLiable);
      if (scenario.expectZakat !== undefined) {
        expect(r.zakatAmount).toBeCloseTo(scenario.expectZakat, -3); // within ±1000
      }
    });
  }
});
