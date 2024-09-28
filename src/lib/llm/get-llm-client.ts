import { Decimal } from "@sql-copilot/gen/prisma/runtime/library";
import { llmConfigRegistry } from "./llm-config-registry";
import OpenAI from "openai";

export type BasePrompt = string;
export type LLMClient = Record<string, unknown> | null | undefined | OpenAI;
export interface LLMConfigRegistry {
  /**
   * Get model client for a specific model.
   * For example, for openai, this would instantiate a client for a specific engine.
   */
  getModelClient(): LLMClient;
}

export type LLMCostBreakdown = {
  cost: Decimal;
  tokensConsumed: string;
  currency: string;
  duration: number;
};

/**
 * Generic function to get an LLM client.
 * Using dependency injection, this function can be replaced with a mock for testing.
 * @returns An LLM client.
 *
 * This way, we can swap out the implementation of the LLM client
 * without changing the code that uses it.
 */
export function getLLMClient(): LLMConfigRegistry {
  // Read a llm configuration registry to determine which large language model to use.
  // For now, we only have OpenAI as an option.
  const llmConfig = llmConfigRegistry.openai;
  return {
    getModelClient: llmConfig.getModelClient,
  };
}
