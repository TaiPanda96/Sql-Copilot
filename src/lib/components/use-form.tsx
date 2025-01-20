import { last } from "lodash";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { UseFormActionResult, zodToFieldErrors } from "./use-form-action";

interface UseFormOptions<TSchema extends z.AnyZodObject, TResult> {
  schema: TSchema;
  initialValues: Partial<TSchema["_input"]>;
  updateOnInitialValuesChange?: boolean;
  onValidSubmit: (
    values: TSchema["_output"]
  ) =>
    | TResult
    | Promise<TResult>
    | Promise<UseFormActionResult<TSchema, TResult>>;
  onSuccess?: (result: TResult) => void | Promise<void>;
  onChange?: (values: TSchema["_input"]) => void;
}

type Dirty<TSchema extends z.AnyZodObject> = Partial<
  Record<keyof TSchema["_input"], boolean>
>;

/**
 * A React hook for handling form state and validation. It muxes server and client-side validation
 * by using Zod for client-side validation and TRPC for server-side validation.
 *
 * Usage:
 * ```ts
 *   const myMutation = trpc.myMutation.useMutation()
 *   const form = useForm({
 *     schema: myMutationInput,
 *     initialValues: {
 *       fieldName: 'default field value',
 *     },
 *     onValidSubmit: myMutation.mutateAsync,
 *     onSuccess(result) {
 *       // handle success
 *     },
 *   })
 *
 *   return (
 *    <form onSubmit={form.handleSubmit}>
 *      <TextInput
 *        label="Input Name"
 *        value={form.values.fieldName}
 *        onChange={(event) => form.setValue('fieldName', event.target.value)}
 *        error={form.errors.fieldName}
 *      />
 *     </form>
 *   )
 * ```
 *
 * @param options.schema The Zod schema to use for validation
 * @param options.initialValues The initial values for the form
 * @param options.onValidSubmit A callback that is called when the form is submitted
 *   and the values are valid.
 * @param options.onSuccess A callback that is called after onValidSubmit runs without throwing
 *   any validation errors.
 */
export function useForm<TSchema extends z.AnyZodObject, TResult>({
  schema,
  initialValues,
  updateOnInitialValuesChange,
  onValidSubmit,
  onSuccess,
  onChange,
}: UseFormOptions<TSchema, TResult>): {
  values: TSchema["_input"];
  errors: ReturnType<typeof zodToFieldErrors<TSchema>>;
  loading: boolean;
  isValid: boolean;
  setValue: <TField extends keyof TSchema["_input"]>(
    field: TField,
    value: TSchema["_input"][TField]
  ) => void;
  setValues: (values: Partial<TSchema["_input"]>) => void;
  setError: <TField extends keyof TSchema["_input"]>(
    field: TField,
    error: string
  ) => void;
  handleSubmit: (
    e?: FormEvent<HTMLFormElement>,
    extraValues?: Partial<TSchema["_input"]>
  ) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<{
    values: TSchema["_input"];
    errors: ReturnType<typeof zodToFieldErrors<TSchema>>;
    dirty: Dirty<TSchema>;
    loading: boolean;
  }>({ values: initialValues, errors: {}, dirty: {}, loading: false });

  const isValid = useMemo(
    () => Object.keys(state.errors).length === 0,
    [state.errors]
  );

  const setValue = useCallback(
    <TField extends keyof TSchema["_input"]>(
      field: TField,
      value: TSchema["_input"][TField]
    ) => {
      setState((state) => {
        const values = {
          ...state.values,
          [field]: value,
        };
        const result = schema.safeParse(values);
        const errors = result.success
          ? {}
          : zodToFieldErrors(result.error, state.dirty);

        onChange?.(values);

        return {
          ...state,
          errors,
          values: {
            ...state.values,
            [field]: value,
          },
          dirty: {
            ...state.dirty,
            [field]: true,
          },
        };
      });
    },
    [onChange, schema]
  );

  const setValues = useCallback(
    (values: Partial<TSchema["_input"]>) => {
      for (const [field, value] of Object.entries(values)) {
        setValue(
          field as keyof TSchema["_input"],
          value as TSchema["_input"][keyof TSchema["_input"]]
        );
      }
    },
    [setValue]
  );

  const setError = useCallback(
    <TField extends keyof TSchema["_input"]>(field: TField, error: string) => {
      setState((state) => ({
        ...state,
        errors: {
          ...state.errors,
          [field]: error,
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (
      e?: FormEvent<HTMLFormElement>,
      extraValues?: Partial<TSchema["_input"]>
    ) => {
      e?.preventDefault();

      const result = schema.safeParse({ ...state.values, ...extraValues });

      if (!result.success) {
        const errors = zodToFieldErrors(result.error);
        console.warn("validation errors", {
          values: { ...state.values, ...extraValues },
          errors,
        });
        setState((state) => ({
          ...state,
          errors,
        }));
        return;
      }

      setState((state) => ({ ...state, loading: true }));

      try {
        const output = await onValidSubmit(result.data as TSchema["_output"]);
        if (resultIsUseFormActionResult(output) && !output.success) {
          setState((state) => ({
            ...state,
            errors: output.errors,
          }));
        } else if (resultIsUseFormActionResult(output) && output.success) {
          await onSuccess?.(output.result);
        } else {
          await onSuccess?.(output);
        }
      } catch (error) {
        if (error instanceof Error && "data" in error) {
          const trpcError = error;
          const data = trpcError.data as {
            issues: { path: string[]; message: string }[];
          };
          const errors = data.issues
            ? (Object.fromEntries(
                data.issues.map((issue) => [last(issue.path), issue.message])
              ) as ReturnType<typeof zodToFieldErrors<TSchema>>)
            : {};
          setState((state) => ({ ...state, errors }));
        } else {
          throw error;
        }
      }

      setState((state) => ({ ...state, loading: false }));
    },
    [schema, state.values, onValidSubmit, onSuccess]
  );

  const handleReset = useCallback(() => {
    setState({ values: initialValues, errors: {}, dirty: {}, loading: false });
  }, [initialValues]);

  useEffect(() => {
    if (updateOnInitialValuesChange) {
      setState({
        values: initialValues,
        errors: {},
        dirty: {},
        loading: false,
      });
    }
  }, [initialValues, updateOnInitialValuesChange]);

  return {
    values: state.values,
    errors: state.errors,
    loading: state.loading,
    reset: handleReset,
    isValid,
    setValue,
    setValues,
    setError,
    handleSubmit,
  };
}

function resultIsUseFormActionResult<TSchema extends z.AnyZodObject, TResult>(
  result: unknown
): result is UseFormActionResult<TSchema, TResult> {
  return result !== null && typeof result === "object" && "success" in result;
}
