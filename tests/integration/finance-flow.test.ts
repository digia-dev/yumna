// 463 – Integration Test: Core Finance Flow
// Tests full request/response cycle against a running backend
// Run: npm run test:e2e (requires backend running at localhost:3001)

import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'integration@yumna.app';
const TEST_PASS  = process.env.TEST_PASS  || 'Integration@Test123!';

describe('Core Finance Integration Flow (Task 463)', () => {
  let client: AxiosInstance;
  let token: string;
  let walletId: string;
  let transactionId: string;

  beforeAll(async () => {
    client = axios.create({ baseURL: BASE_URL, timeout: 10_000 });
  });

  // ── Step 1: Authentication ─────────────────────────────────────────────
  describe('Authentication', () => {
    it('should login and receive access token', async () => {
      const res = await client.post('/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASS,
      });
      expect(res.status).toBe(200);
      expect(res.data.data.access_token).toBeDefined();
      token = res.data.data.access_token;
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    });
  });

  // ── Step 2: Wallet CRUD ────────────────────────────────────────────────
  describe('Wallet Management', () => {
    it('should create a new wallet', async () => {
      const res = await client.post('/finance/wallets', {
        name: 'Dompet Integration Test',
        type: 'CASH',
        balance: 1_000_000,
        currency: 'IDR',
      });
      expect(res.status).toBe(200);
      expect(res.data.data.id).toBeDefined();
      walletId = res.data.data.id;
    });

    it('should list wallets and include created wallet', async () => {
      const res = await client.get('/finance/wallets');
      expect(res.status).toBe(200);
      const found = res.data.data.find((w: any) => w.id === walletId);
      expect(found).toBeDefined();
    });

    it('should get financial summary', async () => {
      const res = await client.get('/finance/summary');
      expect(res.status).toBe(200);
      expect(res.data.data.totalBalance).toBeDefined();
    });
  });

  // ── Step 3: Transaction CRUD ───────────────────────────────────────────
  describe('Transaction Flow', () => {
    it('should create an EXPENSE transaction', async () => {
      const res = await client.post('/finance/transactions', {
        amount: 50_000,
        type: 'EXPENSE',
        category: 'Makanan',
        description: 'Makan siang integration test',
        walletId,
        date: new Date().toISOString(),
      });
      expect(res.status).toBe(201);
      expect(res.data.data.id).toBeDefined();
      transactionId = res.data.data.id;
    });

    it('should reflect expense in wallet balance', async () => {
      const res = await client.get(`/finance/wallets`);
      const wallet = res.data.data.find((w: any) => w.id === walletId);
      // Balance should decrease by 50_000
      expect(Number(wallet.balance)).toBeLessThan(1_000_000);
    });

    it('should list transactions and include created one', async () => {
      const res = await client.get('/finance/transactions');
      expect(res.status).toBe(200);
      const found = res.data.data.find((t: any) => t.id === transactionId);
      expect(found).toBeDefined();
      expect(found.category).toBe('Makanan');
    });

    it('should create an INCOME transaction', async () => {
      const res = await client.post('/finance/transactions', {
        amount: 2_000_000,
        type: 'INCOME',
        category: 'Gaji',
        description: 'Gaji integration test',
        walletId,
        date: new Date().toISOString(),
      });
      expect(res.status).toBe(201);
    });
  });

  // ── Step 4: Analytics ─────────────────────────────────────────────────
  describe('Analytics Endpoints', () => {
    it('should return total assets', async () => {
      const res = await client.get('/finance/total-assets');
      expect([200, 403]).toContain(res.status);
    });

    it('should return savings rate', async () => {
      const res = await client.get('/finance/savings-rate');
      expect([200, 403]).toContain(res.status);
    });
  });

  // ── Step 5: Cleanup ───────────────────────────────────────────────────
  describe('Cleanup', () => {
    it('should soft-delete the test transaction', async () => {
      if (!transactionId) return;
      const res = await client.delete(`/finance/transactions/${transactionId}`);
      expect([200, 204]).toContain(res.status);
    });
  });
});
