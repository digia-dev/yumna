// 455 – Disk Usage Monitoring Service with Scheduled Alerts
// Runs on a cron schedule, queries PostgreSQL for disk/table sizes,
// and triggers alerts when thresholds are exceeded.

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

// ── Thresholds ────────────────────────────────────────────────────────────
const GB = 1024 * 1024 * 1024;

const THRESHOLDS = {
  DB_SIZE_WARNING_GB:  5,    // Warn at 5GB
  DB_SIZE_CRITICAL_GB: 8,    // Critical at 8GB
  TABLE_SIZE_WARNING_GB: 1,  // Warn when any single table > 1GB
  BLOAT_RATIO_WARNING: 2.0,  // Warn when dead_tup > 2× live_tup
};

export interface DiskAlert {
  level: 'WARNING' | 'CRITICAL';
  type: string;
  message: string;
  value: string;
  threshold: string;
  timestamp: string;
}

@Injectable()
export class DiskMonitorService {
  private readonly logger = new Logger('DiskMonitor');
  private lastAlertSent = new Map<string, number>(); // Dedup alerts within 1h

  constructor(private readonly prisma: PrismaService) {}

  // ── 455: Run every hour ───────────────────────────────────────────────────
  @Cron(CronExpression.EVERY_HOUR)
  async runHourlyCheck() {
    await this.checkDiskUsage();
  }

  // ── 455: Run daily summary at 09:00 WIB ──────────────────────────────────
  @Cron('0 2 * * *') // 09:00 WIB = 02:00 UTC
  async runDailySummary() {
    await this.logDailySummary();
  }

  // ── Main disk check ────────────────────────────────────────────────────────
  async checkDiskUsage(): Promise<DiskAlert[]> {
    const alerts: DiskAlert[] = [];

    try {
      // 1. Total database size
      const dbSizeRows: any[] = await this.prisma.$queryRaw`
        SELECT pg_database_size(current_database()) AS size_bytes,
               pg_size_pretty(pg_database_size(current_database())) AS size_pretty
      `;
      const dbSizeBytes = Number(dbSizeRows[0]?.size_bytes ?? 0);
      const dbSizePretty = dbSizeRows[0]?.size_pretty ?? 'unknown';
      const dbSizeGb = dbSizeBytes / GB;

      if (dbSizeGb >= THRESHOLDS.DB_SIZE_CRITICAL_GB) {
        alerts.push(this.makeAlert('CRITICAL', 'DB_SIZE',
          `🚨 Database size CRITICAL: ${dbSizePretty}`,
          dbSizePretty, `${THRESHOLDS.DB_SIZE_CRITICAL_GB}GB`));
      } else if (dbSizeGb >= THRESHOLDS.DB_SIZE_WARNING_GB) {
        alerts.push(this.makeAlert('WARNING', 'DB_SIZE',
          `⚠️ Database size WARNING: ${dbSizePretty}`,
          dbSizePretty, `${THRESHOLDS.DB_SIZE_WARNING_GB}GB`));
      }

      // 2. Largest tables
      const tableRows: any[] = await this.prisma.$queryRaw`
        SELECT
          relname AS table_name,
          pg_total_relation_size(quote_ident(relname)) AS total_bytes,
          pg_size_pretty(pg_total_relation_size(quote_ident(relname))) AS total_pretty
        FROM pg_stat_user_tables
        ORDER BY total_bytes DESC
        LIMIT 10
      `;

      for (const row of tableRows) {
        const tableGb = Number(row.total_bytes) / GB;
        if (tableGb >= THRESHOLDS.TABLE_SIZE_WARNING_GB) {
          alerts.push(this.makeAlert('WARNING', `TABLE_${row.table_name}`,
            `⚠️ Table "${row.table_name}" is large: ${row.total_pretty}`,
            row.total_pretty, `${THRESHOLDS.TABLE_SIZE_WARNING_GB}GB`));
        }
      }

      // 3. Table bloat (dead tuples — needs VACUUM)
      const bloatRows: any[] = await this.prisma.$queryRaw`
        SELECT
          relname AS table_name,
          n_live_tup,
          n_dead_tup,
          CASE WHEN n_live_tup > 0
               THEN ROUND(n_dead_tup::numeric / n_live_tup, 2)
               ELSE 0 END AS bloat_ratio,
          last_vacuum,
          last_autovacuum
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
        ORDER BY bloat_ratio DESC
        LIMIT 5
      `;

      for (const row of bloatRows) {
        if (Number(row.bloat_ratio) >= THRESHOLDS.BLOAT_RATIO_WARNING) {
          alerts.push(this.makeAlert('WARNING', `BLOAT_${row.table_name}`,
            `⚠️ Table "${row.table_name}" has high bloat ratio (${row.bloat_ratio}×). Run VACUUM ANALYZE.`,
            `${row.bloat_ratio}×`, `${THRESHOLDS.BLOAT_RATIO_WARNING}×`));
        }
      }

      // 4. Index health
      const unusedIdxRows: any[] = await this.prisma.$queryRaw`
        SELECT
          indexrelname AS index_name,
          relname AS table_name,
          pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
          idx_scan AS scans
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
          AND pg_relation_size(indexrelid) > 10 * 1024 * 1024
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 5
      `;

      if (unusedIdxRows.length > 0) {
        const names = unusedIdxRows.map((r: any) => r.index_name).join(', ');
        this.logger.warn(`💡 Unused indexes (consider dropping): ${names}`);
      }

      // ── Dispatch alerts ─────────────────────────────────────────────────
      for (const alert of alerts) {
        await this.dispatchAlert(alert);
      }

      if (alerts.length === 0) {
        this.logger.debug(`✅ Disk check OK — DB size: ${dbSizePretty}`);
      }

    } catch (err: any) {
      this.logger.error(`Disk monitor check failed: ${err.message}`);
    }

    return alerts;
  }

  // ── Daily summary log ──────────────────────────────────────────────────────
  private async logDailySummary() {
    try {
      const rows: any[] = await this.prisma.$queryRaw`
        SELECT
          relname                                                       AS table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(relname))) AS size,
          n_live_tup                                                    AS rows
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(quote_ident(relname)) DESC
        LIMIT 8
      `;

      const dbRows: any[] = await this.prisma.$queryRaw`
        SELECT pg_size_pretty(pg_database_size(current_database())) AS total
      `;

      this.logger.log(
        `📊 Daily DB Summary — Total: ${dbRows[0]?.total} | ` +
        rows.map((r: any) => `${r.table_name}(${r.size})`).join(', ')
      );
    } catch (err: any) {
      this.logger.warn(`Daily summary failed: ${err.message}`);
    }
  }

  // ── Alert dedup + dispatch ──────────────────────────────────────────────
  private makeAlert(
    level: 'WARNING' | 'CRITICAL',
    type: string,
    message: string,
    value: string,
    threshold: string,
  ): DiskAlert {
    return { level, type, message, value, threshold, timestamp: new Date().toISOString() };
  }

  private async dispatchAlert(alert: DiskAlert) {
    // Dedup: only fire same alert type once per hour
    const lastSent = this.lastAlertSent.get(alert.type) ?? 0;
    if (Date.now() - lastSent < 60 * 60 * 1000) return;
    this.lastAlertSent.set(alert.type, Date.now());

    // Log to application logs (captured by nestjs-pino → log aggregator)
    if (alert.level === 'CRITICAL') {
      this.logger.error(alert.message);
    } else {
      this.logger.warn(alert.message);
    }

    // Optional: POST to Slack/Discord webhook
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `*[Yumna ${alert.level}]* ${alert.message}\n> Value: ${alert.value} | Threshold: ${alert.threshold}`,
          }),
        });
      } catch (err: any) {
        this.logger.warn(`Failed to send webhook alert: ${err.message}`);
      }
    }
  }

  // ── Manual trigger (for controller/admin endpoint) ────────────────────────
  async runManualCheck() {
    return this.checkDiskUsage();
  }
}
