// 430 – Load Test Suite using k6
// Run: k6 run tests/load/k6-load-test.js
// Install k6: https://grafana.com/docs/k6/latest/get-started/installation/

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Custom metrics ─────────────────────────────────────────────────────────
const errorRate    = new Rate('error_rate');
const authLatency  = new Trend('auth_latency_ms');
const apiLatency   = new Trend('api_latency_ms');
const txnLatency   = new Trend('transaction_latency_ms');
const errorCounter = new Counter('errors');

// ── Test configuration ─────────────────────────────────────────────────────
export const options = {
  // Ramp-up → full load → ramp-down
  stages: [
    { duration: '30s',  target: 50   },  // Warm-up: 0→50 VUs
    { duration: '1m',   target: 200  },  // Ramp to 200 VUs
    { duration: '2m',   target: 500  },  // Sustain 500 VUs
    { duration: '1m',   target: 1000 },  // Peak: 1000 concurrent users
    { duration: '1m',   target: 500  },  // Scale down
    { duration: '30s',  target: 0    },  // Cool-down
  ],

  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95th percentile < 2s
    http_req_failed:   ['rate<0.01'],                 // Error rate < 1%
    error_rate:        ['rate<0.01'],
    auth_latency_ms:   ['p(95)<1000'],
    api_latency_ms:    ['p(95)<1500'],
    txn_latency_ms:    ['p(95)<2000'],
  },
};

const BASE_URL    = __ENV.BASE_URL    || 'http://localhost:3001';
const TEST_EMAIL  = __ENV.TEST_EMAIL  || 'loadtest@yumna.app';
const TEST_PASS   = __ENV.TEST_PASS   || 'LoadTest@123!';

// ── Auth helper ────────────────────────────────────────────────────────────
function authenticate() {
  const start = Date.now();
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASS,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /auth/login' },
  });
  authLatency.add(Date.now() - start);

  const ok = check(res, {
    'login status 200/201': (r) => r.status === 200 || r.status === 201,
    'has access token': (r) => {
      try { return !!JSON.parse(r.body).data?.access_token; } catch { return false; }
    },
  });

  if (!ok) { errorRate.add(1); errorCounter.add(1); return null; }
  errorRate.add(0);

  try { return JSON.parse(res.body).data.access_token; } catch { return null; }
}

// ── Main VU scenario ───────────────────────────────────────────────────────
export default function () {
  const token = authenticate();
  if (!token) { sleep(2); return; }

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // ── Group 1: Dashboard & Wallet reads ──────────────────────────────────
  group('Dashboard reads', () => {
    const start = Date.now();

    const wallets = http.get(`${BASE_URL}/finance/wallets`, { headers, tags: { name: 'GET /wallets' } });
    check(wallets, { 'wallets 200': (r) => r.status === 200 });
    apiLatency.add(Date.now() - start);

    const summary = http.get(`${BASE_URL}/finance/summary`, { headers, tags: { name: 'GET /summary' } });
    check(summary, { 'summary 200': (r) => r.status === 200 });

    const tasks = http.get(`${BASE_URL}/tasks`, { headers, tags: { name: 'GET /tasks' } });
    check(tasks, { 'tasks 200': (r) => r.status === 200 });

    errorRate.add(
      wallets.status !== 200 || summary.status !== 200 || tasks.status !== 200 ? 1 : 0
    );
  });

  sleep(1);

  // ── Group 2: Transaction write ─────────────────────────────────────────
  group('Transaction write', () => {
    // First get a wallet ID
    const walletRes = http.get(`${BASE_URL}/finance/wallets`, { headers });
    let walletId = null;
    try {
      const data = JSON.parse(walletRes.body).data;
      walletId = Array.isArray(data) ? data[0]?.id : null;
    } catch {}

    if (!walletId) return;

    const start = Date.now();
    const txRes = http.post(`${BASE_URL}/finance/transactions`, JSON.stringify({
      amount: Math.floor(Math.random() * 100000) + 10000,
      type: 'EXPENSE',
      category: 'Makanan',
      description: `Load test transaction ${Date.now()}`,
      walletId,
      date: new Date().toISOString(),
    }), { headers, tags: { name: 'POST /transactions' } });

    txnLatency.add(Date.now() - start);
    check(txRes, { 'create txn 200/201': (r) => r.status === 200 || r.status === 201 });
    errorRate.add(txRes.status >= 400 ? 1 : 0);
    if (txRes.status >= 400) errorCounter.add(1);
  });

  sleep(1);

  // ── Group 3: Analytics reads ───────────────────────────────────────────
  group('Analytics', () => {
    const reports = [
      '/finance/total-assets',
      '/finance/savings-rate',
      '/finance/spending-heatmap',
    ];
    for (const endpoint of reports) {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${endpoint}`, { headers, tags: { name: `GET ${endpoint}` } });
      apiLatency.add(Date.now() - start);
      check(res, { [`${endpoint} ok`]: (r) => r.status === 200 || r.status === 403 });
      errorRate.add(res.status >= 500 ? 1 : 0);
    }
  });

  sleep(Math.random() * 2 + 1); // Random think-time 1–3s
}

// ── Smoke test scenario (quick sanity check) ───────────────────────────────
export function smokeTest() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'health ok': (r) => r.status === 200 });
}

// ── Soak test scenario (extended 30-min run) ──────────────────────────────
export const soakOptions = {
  stages: [
    { duration: '5m',  target: 100 },
    { duration: '25m', target: 100 }, // Sustain 100 VUs for 25 min
    { duration: '5m',  target: 0   },
  ],
  thresholds: options.thresholds,
};
