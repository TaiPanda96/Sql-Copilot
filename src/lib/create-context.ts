import { PrismaClient } from "@sql-copilot/gen/prisma";
import { getModelClient } from "@sql-copilot/lib/models/get-model-client";
import { getPrismaClient } from "@sql-copilot/lib/prisma/get-prisma-client";

export interface Context {
  model?: ReturnType<typeof getModelClient>;
  prisma?: PrismaClient;
  config?: Record<string, string>;
}

export type ContextWith<TFields extends keyof Context> = Pick<
  Required<Context>,
  TFields
>;
export type DefaultContext = ContextWith<"prisma" | "config" | "model">;

/**
 * Create Context is a Factory Style function that creates a context object.
 * It uses `withKeys` to determine which keys to include in the context object.
 * @param withKeys
 */
export async function createContext<TWithKeys extends Array<keyof Context>>(
  withKeys: TWithKeys
): Promise<ContextWith<TWithKeys[number]>>;
export async function createContext<
  TWithKeys extends Array<keyof Context>,
  TContext extends Partial<Context>
>(
  withKeys: TWithKeys,
  overrides: TContext
): Promise<ContextWith<TWithKeys[number]> & TContext>;
export async function createContext<
  TWithKeys extends Array<keyof Context>,
  TContext extends Partial<Context>
>(
  withKeys: TWithKeys,
  overrides?: TContext
): Promise<ContextWith<TWithKeys[number]> & TContext> {
  const ctx: Context = {};

  if (withKeys.includes("prisma") || withKeys.includes("config")) {
    ctx.prisma = getPrismaClient();
  }

  if (withKeys.includes("model")) {
    ctx.model = getModelClient();
  }

  return {
    ...ctx,
    ...overrides,
  } as ContextWith<TWithKeys[number]> & TContext;
}
