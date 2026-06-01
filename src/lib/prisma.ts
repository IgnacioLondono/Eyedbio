import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

function poolMaxConnections(): number {
  const parsed = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, 50);
  }
  return 10;
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://eyedbio:eyedbio_secret@localhost:5432/eyedbio?schema=public",
    max: poolMaxConnections(),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}

if (!globalForPrisma.prisma) {
  const created = createPrismaClient();
  globalForPrisma.prisma = created.prisma;
  globalForPrisma.pool = created.pool;
}

export const prisma = globalForPrisma.prisma;
