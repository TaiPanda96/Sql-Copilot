import { ReactNode } from "react";
import { Inline } from "./inline";
import { Stack } from "./stack";
import { Text } from "./text";

export interface InputProps {
  error?: string;
  help?: string | ReactNode;
  label?: string;
  noLabelWrap?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Input({
  error,
  help,
  label,
  noLabelWrap = false,
  optional,
  children,
  disabled,
  className,
}: InputProps & { children: ReactNode }) {
  const result = (
    <Stack gap={2}>
      {label && (
        <Inline gap={1}>
          {label && <Text value={label} bold />}
          {optional && <Text value="(optional)" color="light" />}
        </Inline>
      )}

      {typeof help === "string" ? (
        <Text value={help} size="sm" color="light" />
      ) : (
        help
      )}
      {error && <Text value={error} size="sm" color="error" />}

      {children}
    </Stack>
  );
  if (!noLabelWrap) {
    return <label className={className}>{result}</label>;
  } else {
    return <div className={className}>{result}</div>;
  }
}
