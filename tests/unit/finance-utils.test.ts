// 461 – Unit Tests: Finance Utilities
// Run: cd backend && npm test

import { describe, it, expect, beforeEach } from '@jest/globals';
import { encrypt, decrypt, encryptNumber, decryptNumber, selfTest } from '../src/common/utils/encryption';

// Mock env
process.env.FIELD_ENCRYPTION_KEY = 'yumna_test_encryption_key_minimum_32_chars!!';

describe('AES-256-GCM Field Encryption (Task 423 & 461)', () => {
  it('should pass self-test', () => {
    expect(selfTest()).toBe(true);
  });

  it('should encrypt and decrypt a string', () => {
    const plain = 'Rp 5.000.000 tabungan keluarga';
    const encrypted = encrypt(plain);
    expect(encrypted).not.toBe(plain);
    expect(decrypt(encrypted)).toBe(plain);
  });

  it('should produce different ciphertext each time (IV randomness)', () => {
    const plain = 'same-plaintext';
    expect(encrypt(plain)).not.toBe(encrypt(plain));
  });

  it('should handle null/undefined gracefully', () => {
    expect(encrypt(null)).toBeNull();
    expect(encrypt(undefined)).toBeNull();
    expect(decrypt(null)).toBeNull();
    expect(decrypt(undefined)).toBeNull();
  });

  it('should encrypt and decrypt numbers', () => {
    const amount = 1_234_567.89;
    expect(decryptNumber(encryptNumber(amount))).toBeCloseTo(amount);
  });

  it('should fail decryption if ciphertext tampered', () => {
    const encrypted = encrypt('secret');
    const tampered = encrypted!.slice(0, -4) + 'XXXX';
    expect(() => decrypt(tampered)).toThrow();
  });
});

// ── 462 – Zakat Engine Unit Tests ────────────────────────────────────────────
const GRAM_GOLD_PRICE_IDR = 1_285_000; // example price
const NISAB_GRAMS = 85;
const NISAB_IDR = GRAM_GOLD_PRICE_IDR * NISAB_GRAMS; // 109_225_000

function calculateZakat(totalAssets: number, nisab: number): {
  liable: boolean;
  zakatAmount: number;
  rate: number;
} {
  if (totalAssets < nisab) return { liable: false, zakatAmount: 0, rate: 0.025 };
  return { liable: true, zakatAmount: totalAssets * 0.025, rate: 0.025 };
}

describe('Zakat Calculation Engine (Task 462)', () => {
  it('should not be liable if assets below nisab', () => {
    const result = calculateZakat(50_000_000, NISAB_IDR);
    expect(result.liable).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });

  it('should be liable if assets meet or exceed nisab', () => {
    const result = calculateZakat(150_000_000, NISAB_IDR);
    expect(result.liable).toBe(true);
  });

  it('should calculate zakat at 2.5% rate', () => {
    const assets = 200_000_000;
    const result = calculateZakat(assets, NISAB_IDR);
    expect(result.zakatAmount).toBe(assets * 0.025);
    expect(result.rate).toBe(0.025);
  });

  it('should handle exactly nisab amount', () => {
    const result = calculateZakat(NISAB_IDR, NISAB_IDR);
    expect(result.liable).toBe(true);
    expect(result.zakatAmount).toBeCloseTo(NISAB_IDR * 0.025);
  });

  it('should handle zero assets', () => {
    const result = calculateZakat(0, NISAB_IDR);
    expect(result.liable).toBe(false);
    expect(result.zakatAmount).toBe(0);
  });

  it('should handle very large wealth (e.g. 10 billion)', () => {
    const assets = 10_000_000_000;
    const result = calculateZakat(assets, NISAB_IDR);
    expect(result.zakatAmount).toBe(250_000_000);
  });
});

// ── Finance Utils Tests ──────────────────────────────────────────────────────
function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(amount);
}

function getSavingsRate(income: number, expense: number): number {
  if (income <= 0) return 0;
  return Math.max(0, ((income - expense) / income) * 100);
}

describe('Finance Utility Functions (Task 461)', () => {
  it('formatCurrency should format IDR correctly', () => {
    const result = formatCurrency(1_500_000);
    expect(result).toContain('1.500.000');
  });

  it('getSavingsRate should calculate correctly', () => {
    expect(getSavingsRate(10_000_000, 7_000_000)).toBeCloseTo(30);
  });

  it('getSavingsRate should return 0 for zero income', () => {
    expect(getSavingsRate(0, 5_000_000)).toBe(0);
  });

  it('getSavingsRate should clamp to 0 if expenses exceed income', () => {
    expect(getSavingsRate(5_000_000, 8_000_000)).toBe(0);
  });

  it('getSavingsRate should return 100 for all income saved', () => {
    expect(getSavingsRate(10_000_000, 0)).toBe(100);
  });
});
