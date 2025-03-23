import Decimal from "decimal.js";
import { z } from "zod";

/**
 * Improved Custom Zod Decimal Type for Decimal.js
 * - Coerces numbers, strings, and other convertible values into Decimal.
 * - Handles edge cases safely.
 */
export const zodDecimal = z.preprocess(
  (value) => {
    if (value == null || value === "") return new Decimal(0); // Convert null, undefined, and empty string to Decimal(0)

    if (typeof value === "boolean") return new Decimal(value ? 1 : 0); // Convert boolean to Decimal(1) or Decimal(0)

    if (typeof value === "object" && Decimal.isDecimal(value)) return value; // Preserve existing Decimal values

    try {
      return new Decimal(value as Decimal.Value); // Attempt to convert the value
    } catch {
      throw new Error("Invalid Decimal value"); // Fail if conversion is impossible
    }
  },
  z.custom<Decimal>((val) => Decimal.isDecimal(val), "Expected a valid Decimal")
);
