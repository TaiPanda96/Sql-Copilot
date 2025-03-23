import { isString } from "lodash";
import { ReactNode } from "react";
import { cn } from "shadcn/lib/utils";
import { Text } from "./text";
import { Stack } from "./stack";

export interface SelectInputProps {
  label?: string;
  children?: ReactNode;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: {
    value: string;
    label: string;
  }[];
}

export function SelectInput({
  label,
  onChange,
  className,
  options,
}: SelectInputProps) {
  return (
    <Stack gap={2}>
      {label && (
        <div className="flex flex-row">
          <label className="bg-inherit text-white text-sm">{label}</label>
        </div>
      )}
      <div className="dropdown">
        <select
          className={cn(
            "overflow-x-auto p-2 text-white bg-inherit border rounded-lg",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-opacity-50",
            className
          )}
          onChange={onChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Stack>
  );
}
