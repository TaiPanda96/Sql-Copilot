import { PrismaClient } from "@sql-copilot/gen/prisma";
import { getPrismaClient } from "./prisma/get-prisma-client";
import { getLLMClient } from "./llm/get-llm-client";

export interface Context {
  llm?: ReturnType<typeof getLLMClient>;
  prisma?: PrismaClient;
  config?: Record<string, string>;
}

export type ContextWith<TFields extends keyof Context> = Pick<
  Required<Context>,
  TFields
>;
export type DefaultContext = ContextWith<"prisma" | "config" | "llm">;

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

  if (withKeys.includes("llm")) {
    ctx.llm = getLLMClient();
  }

  return {
    ...ctx,
    ...overrides,
  } as ContextWith<TWithKeys[number]> & TContext;
}
