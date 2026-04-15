// 424/425 – WAF + DDoS Middleware (application-layer)
// Complements cloud-level WAF (Cloudflare/AWS WAF) with local rules

import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// ── In-memory per-IP tracking (replace with Redis in production) ───────────
const ipTracker = new Map<string, { count: number; firstSeen: number; blocked?: boolean }>();
const WINDOW_MS = 60_000;       // 1-minute sliding window
const MAX_REQ   = 200;          // Max 200 requests/minute per IP (rate)
const BURST_MAX = 30;           // Max 30 requests in 3 seconds (burst)
const burstTracker = new Map<string, { count: number; ts: number }>();
const BURST_WINDOW = 3_000;     // 3-second burst window

// ── SQL injection / XSS pattern detection ─────────────────────────────────
const MALICIOUS_PATTERNS = [
  // SQLi
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
  /('|--|;|\/\*|\*\/)/,
  // XSS
  /<script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,
  // Path traversal (449)
  /\.\.[/\\]/,
  /%2e%2e[%2f%5c]/i,
];

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function scanForMalicious(value: string): boolean {
  return MALICIOUS_PATTERNS.some(p => p.test(value));
}

function deepScan(obj: unknown, depth = 0): boolean {
  if (depth > 5)   return false;
  if (!obj || typeof obj !== 'object') return typeof obj === 'string' && scanForMalicious(obj);
  return Object.values(obj as Record<string, unknown>).some(v => deepScan(v, depth + 1));
}

@Injectable()
export class WafMiddleware implements NestMiddleware {
  private readonly logger = new Logger('WAF');

  use(req: Request, res: Response, next: NextFunction) {
    const ip  = getClientIp(req);
    const now = Date.now();

    // ── 425: Burst DDoS protection ─────────────────────────────────────
    const burst = burstTracker.get(ip) ?? { count: 0, ts: now };
    if (now - burst.ts > BURST_WINDOW) {
      burst.count = 1; burst.ts = now;
    } else {
      burst.count++;
    }
    burstTracker.set(ip, burst);

    if (burst.count > BURST_MAX) {
      this.logger.warn(`DDoS burst blocked: IP=${ip} count=${burst.count}`);
      res.setHeader('Retry-After', '3');
      throw new HttpException('Too Many Requests — burst limit', HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── 424: Per-minute rate window ────────────────────────────────────
    const tracker = ipTracker.get(ip) ?? { count: 0, firstSeen: now };
    if (now - tracker.firstSeen > WINDOW_MS) {
      tracker.count = 1; tracker.firstSeen = now;
    } else {
      tracker.count++;
    }
    ipTracker.set(ip, tracker);

    if (tracker.count > MAX_REQ) {
      this.logger.warn(`Rate limit exceeded: IP=${ip} count=${tracker.count}`);
      res.setHeader('Retry-After', '60');
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── 448/449: Payload scanning — SQLi, XSS, path traversal ─────────
    const suspicious =
      deepScan(req.body) ||
      deepScan(req.query) ||
      scanForMalicious(req.path) ||
      (req.headers['user-agent'] && scanForMalicious(req.headers['user-agent'] as string));

    if (suspicious) {
      this.logger.warn(`WAF blocked suspicious request: IP=${ip} path=${req.path}`);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // ── Add security headers ───────────────────────────────────────────
    res.setHeader('X-RateLimit-Limit',     MAX_REQ);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQ - tracker.count));
    res.setHeader('X-RateLimit-Reset',     Math.ceil((tracker.firstSeen + WINDOW_MS) / 1000));

    next();
  }
}
