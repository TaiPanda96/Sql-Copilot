"use client";

import { cva } from "class-variance-authority";
import { ReactNode } from "react";
import { Input, InputProps } from "./input";

export interface TextInputProps extends InputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  children?: ReactNode;
  disabled?: boolean;
  multiline?: boolean;
}

export const textInputVariants = cva(
  [
    "rounded-md",
    "p-1.5",
    "text-brand-600",
    "placeholder:text-gray-400",
    "border-2",
    "outline-0",
    "hover:bg-gray-50",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-brand-600",
    "focus-visible:outline-offset-2",
  ],
  {
    variants: {
      hasError: {
        true: ["pr-10", "ring-red-600"],
      },
      disabled: {
        true: ["bg-gray-50", "text-gray-400"],
      },
    },
  }
);

export function TextInput({
  value,
  onChange,
  error,
  children,
  disabled,
  multiline,
  ...inputProps
}: TextInputProps) {
  const classNames = textInputVariants({ hasError: Boolean(error), disabled });

  return (
    <Input error={error} disabled={disabled} {...inputProps}>
      {multiline ? (
        <textarea
          className={classNames}
          onChange={(event) => onChange?.(event.target.value)}
          value={value ?? undefined}
          disabled={disabled}
        />
      ) : (
        <input
          className={classNames}
          onChange={(event) => onChange?.(event.target.value)}
          value={value ?? undefined}
          disabled={disabled}
        />
      )}
      {children}
    </Input>
  );
}
