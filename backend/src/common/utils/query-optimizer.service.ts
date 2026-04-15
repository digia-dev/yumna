// 426 – Database Query Performance Optimizer
// Provides EXPLAIN ANALYZE utilities and pg_stat_statements analysis

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QueryOptimizerService implements OnModuleInit {
  private readonly logger = new Logger('QueryOptimizer');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // 426 – Slow-query logging at DB level.
    // In PostgreSQL: log_min_duration_statement = 500 (in postgresql.conf)
    // Application monitoring: use getTopSlowQueries() below.
    this.logger.log(
      `QueryOptimizer active. ` +
      `Set log_min_duration_statement=500 in postgresql.conf for DB-level slow query logging.`,
    );
  }

  /**
   * 426 – Run EXPLAIN ANALYZE on a raw SQL query and return results.
   * Use in development to inspect query plans.
   */
  async explainAnalyze(sql: string, params: unknown[] = []): Promise<any[]> {
    return this.prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${sql}`, ...params);
  }

  /**
   * 426 – Top slow queries from pg_stat_statements
   * (requires pg_stat_statements extension enabled in PostgreSQL)
   */
  async getTopSlowQueries(limit = 10): Promise<any[]> {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          LEFT(query, 200)                   AS query_snippet,
          calls,
          ROUND(total_exec_time::numeric, 2) AS total_ms,
          ROUND(mean_exec_time::numeric, 2)  AS avg_ms,
          ROUND(max_exec_time::numeric, 2)   AS max_ms,
          rows
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat%'
        ORDER BY mean_exec_time DESC
        LIMIT ${limit}
      `;
    } catch {
      return [{ note: 'pg_stat_statements not available. Enable it in postgresql.conf.' }];
    }
  }

  /**
   * 426 – Check tables that might need indexes via pg_stat_user_tables
   */
  async getMissingIndexSuggestions(): Promise<any[]> {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          relname        AS table_name,
          seq_scan,
          seq_tup_read,
          idx_scan,
          n_live_tup     AS live_rows,
          CASE
            WHEN idx_scan = 0          THEN 'NO INDEX USED — consider adding one'
            WHEN seq_scan > idx_scan   THEN 'Seq scans > idx scans — might need index'
            ELSE 'OK'
          END AS suggestion
        FROM pg_stat_user_tables
        WHERE seq_scan > 0
        ORDER BY seq_tup_read DESC
        LIMIT 20
      `;
    } catch {
      return [{ note: 'Could not access pg_stat_user_tables.' }];
    }
  }
}
