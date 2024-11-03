import { Prisma, PrismaClient } from "@sql-copilot/gen/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | null;
}

export function getPrismaClient(): PrismaClient {
  if (global.prisma) return global.prisma;

  // https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging
  let prismaLogLevels: Array<Prisma.LogLevel> = ["info", "error"];
  const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}` });
  const adapter = new PrismaPg(pool);

  global.prisma = new PrismaClient({
    log: prismaLogLevels,
    adapter,
  });

  return global.prisma;
}
