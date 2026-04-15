// 452 – Data Anonymization Utilities
// Used for analytics exports and any aggregations shared outside family scope.

/**
 * Anonymize a user ID → short hash (first 8 chars of SHA-256)
 * No PII exposed, but consistent within one export batch.
 */
export async function anonymizeId(id: string, salt = 'yumna-anon'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${id}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'usr_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
}

/**
 * Anonymize a name → initials only (e.g. "Ahmad Fauzi" → "A. F.")
 */
export function anonymizeName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + '.')
    .join(' ');
}

/**
 * Anonymize an email → "a***@gmail.com"
 */
export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.min(local.length - 1, 5))}@${domain}`;
}

/**
 * Round a financial amount to nearest bucket for aggregated analytics.
 * Prevents reverse-engineering exact salaries/balances.
 * e.g. 5_234_000 → 5_000_000 (bucket = 500_000)
 */
export function bucketAmount(amount: number, bucket = 500_000): number {
  return Math.round(amount / bucket) * bucket;
}

/**
 * Anonymize transaction list for aggregate analytics.
 * Strips names, user IDs, exact amounts — preserves categories and dates.
 */
export function anonymizeTransactions(transactions: any[]): any[] {
  return transactions.map(txn => ({
    id:           'txn_anon',
    date:         txn.date ? new Date(txn.date).toISOString().split('T')[0] : null, // date only, no time
    type:         txn.type,
    category:     txn.category,
    amount:       bucketAmount(Number(txn.amount)),
    currency:     txn.currency || 'IDR',
    // Deliberately excluded: description, userId, walletId, attachments, metadata
  }));
}

/**
 * Anonymize wallet list for aggregate views.
 */
export function anonymizeWallets(wallets: any[]): any[] {
  return wallets.map((w, i) => ({
    id:      `wallet_${i + 1}`,
    type:    w.type,
    balance: bucketAmount(Number(w.balance)),
    currency: w.currency || 'IDR',
    // Excluded: name, userId, familyId
  }));
}

/**
 * Full anonymized report object — safe for aggregate / benchmark sharing
 */
export function buildAnonymizedReport(data: {
  transactions: any[];
  wallets: any[];
  familySize: number;
  month: string;
}) {
  const totalIncome  = data.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = data.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  return {
    reportType: 'ANONYMIZED_AGGREGATE',
    generatedAt: new Date().toISOString(),
    month: data.month,
    familySize: data.familySize, // safe — no PII
    summary: {
      totalIncome:  bucketAmount(totalIncome),
      totalExpense: bucketAmount(totalExpense),
      savingsRate:  totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : 0,
    },
    categoryBreakdown: Object.entries(
      data.transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc: any, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {})
    ).map(([category, total]) => ({
      category,
      total: bucketAmount(total as number),
    })).sort((a, b) => b.total - a.total),
    wallets: anonymizeWallets(data.wallets),
    // Raw transactions deliberately EXCLUDED
  };
}
