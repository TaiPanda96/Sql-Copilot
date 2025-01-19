import { z } from "zod";

/**
 * This is the standard return type for a form action. It's used to pass
 * validation errors back to `useForm` to that can be shown to the user in the correct way.
 */
export type UseFormActionResult<
  TSchema extends z.AnyZodObject = z.AnyZodObject,
  TResult = unknown
> =
  | {
      success: true;
      result: TResult;
    }
  | {
      success: false;
      errors: UseFormFieldError<TSchema>;
    };

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
  schema: TSchema
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
 * Convert Zod errors into a simpler form that can be used by `useForm`
 */
export function zodToFieldErrors<TSchema extends z.AnyZodObject>(
  error?: z.SafeParseError<TSchema["_input"]>["error"],
  dirty?: Partial<Record<keyof TSchema["_input"], boolean>>
) {
  if (!error) {
    return {};
  }

  // Zod returns the wrong type here, so we have to cast it
  const zodFormat = error.format() as { [key: string]: { _errors: string[] } };
  const zodEntries = Object.entries(zodFormat).filter(
    ([field]) => field !== "_errors"
  );

  return Object.fromEntries(
    zodEntries
      .filter(([field]) => !dirty || dirty[field as keyof TSchema["_input"]])
      .flatMap(([field, fieldErrors]) => {
        return flattenFieldErrors(field, fieldErrors);
      })
  );
}

function flattenFieldErrors(
  field: string,
  fieldErrors: ZodErrorNode
): [string, string][] {
  const errors = [] as [string, string][];
  if (fieldErrors["_errors"].length > 0) {
    errors.push([field, fieldErrors._errors[0]]);
  }
  const filteredFieldErrors = Object.entries(fieldErrors).filter(
    ([key]) => key !== "_errors"
  );
  if (filteredFieldErrors.length > 0) {
    for (const [key, value] of filteredFieldErrors) {
      if (!isNaN(parseInt(key))) {
        errors.push(
          ...flattenFieldErrors(`${field}[${key}]`, value as ZodErrorNode)
        );
      } else {
        errors.push(
          ...flattenFieldErrors(`${field}.${key}`, value as ZodErrorNode)
        );
      }
    }
  }

  return errors;
}

export type UseFormFieldError<TSchema extends z.AnyZodObject = z.AnyZodObject> =
  ReturnType<typeof zodToFieldErrors<TSchema>>;

export class InputError extends Error {
  constructor(public inputKey: string, message: string) {
    super(message);
  }
}

/**
 * For handling InputErrors from server-side actions and converting them into a form error.
 */
export function handleActionInputError<TSchema extends z.AnyZodObject, TResult>(
  error: unknown,
  inputSchema: TSchema
): UseFormActionResult<TSchema, TResult> {
  if (error instanceof InputError && error.inputKey in inputSchema.shape) {
    return {
      success: false,
      errors: { [error.inputKey]: error.message },
    };
  }

  if (error instanceof Error) {
    console.error(error);

    return {
      success: false,
      errors: { _global: "An unexpected error occurred" },
    };
  }

  throw error;
}
