"use client";

import { cva } from "class-variance-authority";
import { ReactNode } from "react";
import { Input, InputProps } from "./input";
import { cn } from "shadcn/lib/utils";
import { isString } from "lodash";

export interface TextInputProps extends InputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  children?: ReactNode;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
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
  label,
  onChange,
  error,
  children,
  disabled,
  multiline,
  className,
  ...inputProps
}: TextInputProps) {
  const classNames = textInputVariants({ hasError: Boolean(error), disabled });

  return (
    <Input
      error={error}
      disabled={disabled}
      {...inputProps}
      className="relative"
    >
      {label && (
        <div className="flex flex-grow">
          {isString(label) ? (
            <label className="text-sm text-white">{label}</label>
          ) : (
            label
          )}
        </div>
      )}

      {multiline ? (
        <textarea
          aria-label={label}
          className={`${classNames} resize-none w-full h-32 max-h-32 overflow-y-auto ${className}`}
          onChange={(event) => onChange?.(event.target.value)}
          value={value ?? undefined}
          disabled={disabled}
        />
      ) : (
        <input
          aria-label={label}
          className={cn(
            "resize-x",
            "rounded-lg",
            "p-1.5",
            "focus-visible:outline",
            className
          )}
          onChange={(event) => onChange?.(event.target.value)}
          value={value ?? undefined}
          disabled={disabled}
        />
      )}
      {children}
    </Input>
  );
}
