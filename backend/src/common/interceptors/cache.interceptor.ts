// 453 – Redis API Response Caching Interceptor
// Usage: @UseInterceptors(CacheInterceptor) on any controller method
// Or apply globally after Redis is configured.

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

// ── In-memory cache fallback (when Redis is unavailable) ─────────────────
// Swap this out with an `ioredis` client once Redis is provisioned.
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

const DEFAULT_TTL_SECONDS = 60; // 1 minute default

export function clearCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) memoryCache.delete(key);
  }
}

// ── Cache key builder ──────────────────────────────────────────────────────
function buildCacheKey(request: any): string {
  const { method, url, user } = request;
  const familyId = user?.familyId || 'anon';
  // Include query params in key
  return `yumna:cache:${method}:${familyId}:${url}`;
}

// ── Cacheable decorator (for marking TTL per method) ─────────────────────
export const CACHE_TTL_KEY = 'cache_ttl';
export const Cacheable = (ttlSeconds = DEFAULT_TTL_SECONDS) =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_TTL_KEY, ttlSeconds, descriptor.value);
    return descriptor;
  };

// ── Main Interceptor ──────────────────────────────────────────────────────
@Injectable()
export class YumnaCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CacheInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') return next.handle();

    const cacheKey = buildCacheKey(request);
    const ttl = Reflect.getMetadata(CACHE_TTL_KEY, context.getHandler()) ?? DEFAULT_TTL_SECONDS;

    // Check cache hit
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`Cache HIT [${cacheKey.slice(0, 60)}]`);
      return of(cached.data);
    }

    // Cache miss — execute and store
    return next.handle().pipe(
      tap((data) => {
        memoryCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl * 1000,
        });
        this.logger.debug(`Cache SET [ttl=${ttl}s] [${cacheKey.slice(0, 60)}]`);

        // Evict old entries to prevent memory bloat
        if (memoryCache.size > 500) {
          const now = Date.now();
          for (const [key, val] of memoryCache.entries()) {
            if (val.expiresAt < now) memoryCache.delete(key);
          }
        }
      }),
    );
  }
}

// ── Cache TTLs per endpoint (reference) ───────────────────────────────────
// Apply @Cacheable(ttl) to individual endpoints, e.g.:
//
// @Get('summary')
// @Cacheable(300)  // 5 min cache
// async getSummary() { ... }
//
// @Get('spending-heatmap')
// @Cacheable(600)  // 10 min
// async getHeatmap() { ... }
//
// Clear cache on mutation:
//   clearCache(`yumna:cache:GET:${familyId}`);

export const RECOMMENDED_CACHE_TTLS = {
  'GET /finance/summary':            300,  // 5 min
  'GET /finance/total-assets':       300,
  'GET /finance/savings-rate':       300,
  'GET /finance/spending-heatmap':   600,  // 10 min
  'GET /finance/comparative-analytics': 1800, // 30 min
  'GET /finance/net-worth':          900,
  'GET /zakat/nisab':               3600,  // 1 hour (price doesn't change often)
  'GET /tasks':                        30,  // 30s (team collaborates live)
  'GET /events':                       60,
  'GET /notes':                        60,
  'GET /bills':                        60,
};
