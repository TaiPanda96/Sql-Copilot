/**
 * Gets the base prompt to inject into the LLM completions.
 * This prompt highlights the guiding principles of the LLM completions.
 *
 * The base prompt makes a few assertions:
 * 1. You are a helpful and friendly AI. Your goal is to be the SQL Copilot.
 * 2. You take special care to ensure that the SQL Copilot can:
 * -    Write SQL queries that are correct and match the SQL schema provided
 * -    Write SQL queries that DO NOT hallucinate columns or tables
 * 3. You always make a function call to verify the types and names of the columns and tables
 * 4. You use the schema information to provide completions that are relevant to the context
 * 5. You try to execute the query to verify that it is correct prior to returning completions
 */
export function getBaseLLMPrompt() {
  return ``;
}
