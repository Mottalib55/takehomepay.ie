import { describe, it, expect } from 'vitest';
import { calculateSalary } from './engine';

const DEFAULT = { pensionRate: 0, additionalCredits: 0 };

describe('Income Tax', () => {
  it('calculates tax for income below SRCOP (single)', () => {
    const r = calculateSalary({ grossAnnual: 35_000, filingStatus: 'single', ...DEFAULT });
    // All at 20%: 35000 × 0.20 = 7000 - credits (1875 + 1875) = 3250
    expect(r.incomeTaxGross).toBeCloseTo(7_000, 0);
    expect(r.incomeTaxNet).toBeCloseTo(3_250, 0);
  });

  it('calculates tax for income above SRCOP (single)', () => {
    const r = calculateSalary({ grossAnnual: 60_000, filingStatus: 'single', ...DEFAULT });
    // 42000 × 0.20 + 18000 × 0.40 = 8400 + 7200 = 15600 - 3750 credits = 11850
    expect(r.incomeTaxGross).toBeCloseTo(15_600, 0);
    expect(r.incomeTaxNet).toBeCloseTo(11_850, 0);
  });

  it('applies married one income SRCOP and credits', () => {
    const r = calculateSalary({ grossAnnual: 60_000, filingStatus: 'married_one_income', ...DEFAULT });
    // SRCOP = 51000: 51000×0.20 + 9000×0.40 = 10200 + 3600 = 13800
    // Credits: 3750 (married) + 1875 (PAYE) + 1800 (home carer) = 7425
    // Net tax = 13800 - 7425 = 6375
    expect(r.incomeTaxGross).toBeCloseTo(13_800, 0);
    expect(r.incomeTaxNet).toBeCloseTo(6_375, 0);
  });

  it('applies single parent credits', () => {
    const r = calculateSalary({ grossAnnual: 40_000, filingStatus: 'single_parent', ...DEFAULT });
    // Credits: 1875 (personal) + 1875 (PAYE) + 1750 (SPCCC) = 5500
    expect(r.taxCreditsTotal).toBe(5_500);
  });

  it('never returns negative income tax', () => {
    const r = calculateSalary({ grossAnnual: 10_000, filingStatus: 'single', ...DEFAULT });
    expect(r.incomeTaxNet).toBe(0);
  });
});

describe('USC', () => {
  it('exempts income below threshold', () => {
    const r = calculateSalary({ grossAnnual: 12_000, filingStatus: 'single', ...DEFAULT });
    expect(r.usc).toBe(0);
  });

  it('calculates USC for standard income', () => {
    const r = calculateSalary({ grossAnnual: 50_000, filingStatus: 'single', ...DEFAULT });
    // Band 1: 12012 × 0.5% = 60.06
    // Band 2: (25760-12012) × 2% = 274.96
    // Band 3: (50000-25760) × 4% = 969.60
    // Total ≈ 1304.62
    expect(r.usc).toBeCloseTo(1_304.62, 0);
  });

  it('applies 8% band for high earners', () => {
    const r = calculateSalary({ grossAnnual: 100_000, filingStatus: 'single', ...DEFAULT });
    // Band 1: 60.06, Band 2: 274.96, Band 3: (70044-25760)×4% = 1771.36, Band 4: (100000-70044)×8% = 2396.48
    // Total ≈ 4502.86
    expect(r.usc).toBeCloseTo(4_502.86, 0);
  });
});

describe('PRSI', () => {
  it('exempts low weekly income', () => {
    // 352 × 52 = 18_304
    const r = calculateSalary({ grossAnnual: 18_000, filingStatus: 'single', ...DEFAULT });
    expect(r.prsi).toBe(0);
  });

  it('calculates PRSI at 4% for standard income', () => {
    const r = calculateSalary({ grossAnnual: 50_000, filingStatus: 'single', ...DEFAULT });
    expect(r.prsi).toBeCloseTo(2_000, 0);
  });
});

describe('Pension deduction', () => {
  it('reduces taxable income by pension contribution', () => {
    const without = calculateSalary({ grossAnnual: 60_000, filingStatus: 'single', pensionRate: 0, additionalCredits: 0 });
    const with5 = calculateSalary({ grossAnnual: 60_000, filingStatus: 'single', pensionRate: 0.05, additionalCredits: 0 });

    expect(with5.pensionContribution).toBe(3_000);
    expect(with5.taxableIncome).toBe(57_000);
    expect(with5.incomeTaxNet).toBeLessThan(without.incomeTaxNet);
  });
});

describe('Full calculation', () => {
  it('calculates net for a typical single earner at 50k', () => {
    const r = calculateSalary({ grossAnnual: 50_000, filingStatus: 'single', ...DEFAULT });

    expect(r.netAnnual).toBeGreaterThan(50_000 * 0.60);
    expect(r.netAnnual).toBeLessThan(50_000 * 0.80);
    expect(r.effectiveTotalRate).toBeGreaterThan(0.20);
    expect(r.effectiveTotalRate).toBeLessThan(0.40);
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 12, 0);
    expect(r.netWeekly).toBeCloseTo(r.netAnnual / 52, 0);
  });

  it('handles zero salary', () => {
    const r = calculateSalary({ grossAnnual: 0, filingStatus: 'single', ...DEFAULT });
    expect(r.netAnnual).toBe(0);
    expect(r.effectiveTotalRate).toBe(0);
  });

  it('calculates employer cost', () => {
    const r = calculateSalary({ grossAnnual: 50_000, filingStatus: 'single', ...DEFAULT });
    expect(r.employerPRSI).toBeGreaterThan(0);
    expect(r.totalEmployerCost).toBeGreaterThan(50_000);
  });

  it('calculates marginal rate correctly', () => {
    const below = calculateSalary({ grossAnnual: 35_000, filingStatus: 'single', ...DEFAULT });
    const above = calculateSalary({ grossAnnual: 60_000, filingStatus: 'single', ...DEFAULT });

    // Below SRCOP: 20% + USC + PRSI
    expect(below.marginalRate).toBeLessThan(above.marginalRate);
    // Above SRCOP: 40% + USC 8% band possible + PRSI 4%
    expect(above.marginalRate).toBeGreaterThan(0.40);
  });
});
