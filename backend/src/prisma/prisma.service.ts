// 437 – Database Read Replica Support via @prisma/extension-read-replicas
// Reads (findMany, findFirst, findUnique, count, aggregate) → REPLICA
// Writes (create, update, delete, upsert, executeRaw)       → PRIMARY
//
// Required env vars:
//   DATABASE_URL         = postgresql://user:pass@primary-host/yumna_db
//   DATABASE_REPLICA_URL = postgresql://user:pass@replica-host/yumna_db
//
// If DATABASE_REPLICA_URL is absent, all queries fall through to primary.

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readReplicas } from '@prisma/extension-read-replicas';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');

  // Extended client with replica routing — used by modules that need replica reads
  // Access via prismaService.replica.user.findMany() for explicit replica routing,
  // or use prismaService directly (primary) for all other cases.
  replica!: ReturnType<PrismaClient['$extends']>;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // 437 – Wire read-replica extension if DATABASE_REPLICA_URL is configured
    const replicaUrl = process.env.DATABASE_REPLICA_URL;

    if (replicaUrl) {
      const replicaPool = new Pool({
        connectionString: replicaUrl,
        max: 20,           // replicas can handle more concurrent reads
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 2_000,
      });
      const replicaAdapter = new PrismaPg(replicaPool);
      const replicaClient  = new PrismaClient({
        adapter: replicaAdapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
      await replicaClient.$connect();

      // Attach the extended (replica-aware) client for high-read services
      this.replica = this.$extends(readReplicas({ replicas: [replicaClient] }));

      this.logger.log(
        '✅ Read replica ACTIVE — reads → replica, writes → primary',
      );
    } else {
      // Graceful fallback: replica points to self (primary handles everything)
      this.replica = this.$extends({});
      this.logger.log(
        '⚠️  DATABASE_REPLICA_URL not set — all queries routed to primary',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
