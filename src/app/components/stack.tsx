import classNames from "classnames";
import { ReactNode } from "react";

interface StackProps {
  align?: "left" | "right" | "center" | "stretch";
  children: ReactNode;
  className?: string;
  gap?: number;
  grow?: boolean;
}

export function Stack({
  align,
  children,
  className,
  gap = 2,
  grow = false,
}: StackProps) {
  return (
    <div
      className={classNames(className, "flex", "flex-col", {
        "items-center": align === "center",
        "items-end": align === "right",
        "items-start": align === "left",
        "items-stretch": align === "stretch",
        "flex-grow": grow,
      })}
      style={{ gap: `${gap * 0.25}rem` }} // Tailwind's default gap scale is 0.25rem per unit
    >
      {children}
    </div>
  );
}
