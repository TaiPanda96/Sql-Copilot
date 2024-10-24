import { UseFormActionResult } from "@sql-copilot/lib/components/use-form";
import { z } from "zod";

interface ZodErrorNode {
  [key: string]: ZodErrorNode | Array<string>;
  _errors: Array<string>;
}
/**
 * Used to run input through a Zod schema and get the UseFormActionResult for
 * the errors, if any are present.
 *
 * @usage
 * ```ts
 * const validation = validateActionInput(input, schema)
 * if (!validation.success) {
 *   return validation
 * }
 *
 * const result =await myActionIo(ctx, validation.data)
 *
 * return {
 *   success: true,
 *   result,
 * }
 * ```
 */

export function validateActionInput<TSchema extends z.AnyZodObject>(
  input: z.input<TSchema>,
  schema: TSchema,
):
  | { success: true; data: z.output<TSchema> }
  | { success: false; errors: UseFormFieldError<TSchema> } {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  } else {
    return { success: false, errors: zodToFieldErrors(parsed.error) };
  }
}

/**
 * Transforms Zod Errors to a Flat Object of Field Errors
 * @param error The Zod error object
 * @param dirty The dirty state of the form
 */
export function zodToFieldErrors<TSchema extends z.AnyZodObject>(
  error?: z.SafeParseError<TSchema["_input"]>["error"],
  dirty?: Partial<Record<keyof TSchema["_input"], boolean>>,
) {
  if (!error) {
    return {};
  }

  // Zod returns the wrong type here, so we have to cast it
  const zodFormat = error.format() as { [key: string]: { _errors: string[] } };
  const zodEntries = Object.entries(zodFormat).filter(
    ([field]) => field !== "_errors",
  );

  return Object.fromEntries(
    zodEntries
      .filter(([field]) => !dirty || dirty[field as keyof TSchema["_input"]])
      .flatMap(([field, fieldErrors]) => {
        return flattenFieldErrors(field, fieldErrors);
      }),
  );
}

/**
 * Utility function to flatten Zod errors into a list of field errors.
 */
function flattenFieldErrors(
  field: string,
  fieldErrors: ZodErrorNode,
): [string, string][] {
  const errors = [] as [string, string][];
  if (fieldErrors["_errors"].length > 0) {
    errors.push([field, fieldErrors._errors[0]]);
  }
  const filteredFieldErrors = Object.entries(fieldErrors).filter(
    ([key]) => key !== "_errors",
  );
  if (filteredFieldErrors.length > 0) {
    for (const [key, value] of filteredFieldErrors) {
      if (!isNaN(parseInt(key))) {
        errors.push(
          ...flattenFieldErrors(`${field}[${key}]`, value as ZodErrorNode),
        );
      } else {
        errors.push(
          ...flattenFieldErrors(`${field}.${key}`, value as ZodErrorNode),
        );
      }
    }
  }

  return errors;
}

/**
 * Use Form standard Field Error, which uses zod schemas to validate input.
 * If errors are surfaced, we call `zodToFieldErrors` to convert the zod errors to friendly
 * field errors (friendly in the sense of form validation).
 */
export type UseFormFieldError<TSchema extends z.AnyZodObject = z.AnyZodObject> =
  ReturnType<typeof zodToFieldErrors<TSchema>>;

/**
 * For handling InputErrors from server-side actions and converting them into a form error.
 */
export function handleActionInputError<TSchema extends z.AnyZodObject, TResult>(
  error: unknown,
  inputSchema: TSchema,
): UseFormActionResult<TSchema, TResult> {
  if (error instanceof InputError && error.inputKey in inputSchema.shape) {
    return {
      success: false,
      errors: { [error.inputKey]: error.message },
    };
  }

  if (error instanceof Error) {
    // non-input errors are unexpected and should be reported to Sentry, but we still
    // want to inform the user that something went wrong
    console.error(error);

    return {
      success: false,
      errors: { _global: "An unexpected error occurred" },
    };
  }

  throw error;
}

/**
 * An error that is associated with some input.
 * Zod should be used for schema (data shape) validation.
 *
 * @param inputKey The key of the input that caused the error (i.e. parameter name)
 * @param message The error message; preferably customer friendly for display.
 */
export class InputError extends Error {
  public readonly inputKey: string;

  constructor(inputKey: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.inputKey = inputKey;

    // Maintain stack trace
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
