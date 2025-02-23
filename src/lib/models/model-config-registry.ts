import { getOpenAiClient } from "./llms/open-ai/get-open-ai-client";

/**
 * This LLM config registry is used to determine which large language model to use.
 * It is a simple key-value store where the key is the model name and the value is the configuration.
 */

export const modelConfigRegistry = {
  openai: {
    getModelClient: getOpenAiClient,
  },
  claude: {
    getModelClient: () => {
      throw new Error("Not implemented");
    },
  },
};
