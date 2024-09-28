import { Prisma, PrismaClient } from "@sql-copilot/gen/prisma";

declare global {
  // eslint-disable-next-line no-unused-vars, no-var
  var prisma: PrismaClient | null;
}

export function getPrismaClient(): PrismaClient {
  if (global.prisma) return global.prisma;

  // https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging
  let prismaLogLevels: Array<Prisma.LogLevel> = ["info", "error"];

  const databaseUrl = process.env.DATABASE_URL;

  global.prisma = new PrismaClient({
    log: prismaLogLevels,
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  return global.prisma;
}
