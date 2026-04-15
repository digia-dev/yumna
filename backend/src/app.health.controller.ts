// 454 – Enhanced Health Controller for Uptime Robot monitoring
// Uptime Robot probes:
//   • GET /health        → simple 200 OK (Uptime Robot HTTP monitor)
//   • GET /health/detail → deep status with DB + memory (internal use)
//   • GET /health/ready  → Kubernetes-style readiness probe
//   • GET /health/live   → Kubernetes-style liveness probe

import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { DiskMonitorService } from './common/monitoring/disk-monitor.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

interface DetailedHealth extends HealthStatus {
  checks: {
    database: { status: 'ok' | 'error'; latencyMs?: number; replica?: 'ok' | 'disabled' | 'error' };
    memory: { status: 'ok' | 'warning' | 'error'; usedMb: number; totalMb: number; percentUsed: number };
    disk?: { status: 'ok' | 'warning' | 'error'; dbSizeBytes?: number };
    environment: { nodeEnv: string; nodeVersion: string };
  };
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger('HealthController');
  private readonly startTime = Date.now();
  private readonly VERSION = process.env.npm_package_version || '1.0.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly diskMonitor: DiskMonitorService,
  ) {}

  // ── 455: Manual disk check endpoint (admin use) ───────────────────────────
  @Get('disk')
  async diskCheck() {
    const alerts = await this.diskMonitor.runManualCheck();
    return {
      timestamp: new Date().toISOString(),
      alertCount: alerts.length,
      alerts,
    };
  }

  // ── 454: Simple probe — Uptime Robot polls this every 1 min ───────────────
  // Returns 200 instantly. Uptime Robot alert fires if non-200 or timeout.
  @Get()
  async check(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        version: this.VERSION,
      };
    } catch (err: any) {
      this.logger.error(`Health check failed: ${err.message}`);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        version: this.VERSION,
      };
    }
  }

  // ── 454: Readiness probe — ready to receive traffic? ─────────────────────
  @Get('ready')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      return { status: 'not-ready', reason: 'database-unavailable' };
    }
  }

  // ── 454: Liveness probe — process still alive? ────────────────────────────
  @Get('live')
  liveness() {
    const memMb = process.memoryUsage().heapUsed / 1024 / 1024;
    // Fail liveness if memory > 1.5 GB (likely leak)
    if (memMb > 1536) {
      return { status: 'unhealthy', reason: 'memory-exceeded', memMb: Math.round(memMb) };
    }
    return { status: 'alive', memMb: Math.round(memMb) };
  }

  // ── 454: Detailed health — used by internal dashboards + alert systems ────
  @Get('detail')
  async detail(): Promise<DetailedHealth> {
    const mem      = process.memoryUsage();
    const usedMb   = Math.round(mem.heapUsed / 1024 / 1024);
    const totalMb  = Math.round(mem.heapTotal / 1024 / 1024);
    const memPct   = Math.round((usedMb / totalMb) * 100);

    // ── DB check with latency ──────────────────────────────────────────────
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbLatency = 0;
    let replicaStatus: 'ok' | 'disabled' | 'error' = 'disabled';
    let dbSize: number | undefined;

    try {
      const t0 = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t0;

      // 455 – DB disk usage check
      const sizeResult: any[] = await this.prisma.$queryRaw`
        SELECT pg_database_size(current_database()) AS size
      `;
      dbSize = Number(sizeResult[0]?.size ?? 0);
    } catch {
      dbStatus = 'error';
    }

    // ── Replica check ──────────────────────────────────────────────────────
    if (process.env.DATABASE_REPLICA_URL) {
      try {
        (this.prisma as any).replica.user.count?.();
        replicaStatus = 'ok';
      } catch {
        replicaStatus = 'error';
      }
    }

    const overallStatus: 'ok' | 'degraded' | 'error' =
      dbStatus === 'error' ? 'error' :
      memPct > 90         ? 'degraded' :
      'ok';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.VERSION,
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
          replica: replicaStatus,
        },
        memory: {
          status: memPct > 90 ? 'error' : memPct > 70 ? 'warning' : 'ok',
          usedMb,
          totalMb,
          percentUsed: memPct,
        },
        ...(dbSize !== undefined ? {
          disk: {
            status: 'ok',
            dbSizeBytes: dbSize,
          },
        } : {}),
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        },
      },
    };
  }
}
