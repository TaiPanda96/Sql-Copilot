import classNames from "classnames";

export interface InlineProps {
  children?: React.ReactNode;
  align?: "top" | "center" | "bottom";
  className?: string;
  gap?: number;
  direction?: "row" | "column";
  justify?: "left" | "center" | "right" | "between" | "around" | "stretch";
  grow?: boolean;
}

export function Inline({
  align = "center",
  children,
  className,
  gap = 6,
  justify = "left",
  grow = false,
}: InlineProps) {
  return (
    <div
      className={classNames(
        "flex",
        "flex-row",
        {
          [`gap-${gap}`]: gap !== 0,
          "justify-center": justify === "center",
          "justify-end": justify === "right",
          "justify-start": justify === "left",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-items-stretch": justify === "stretch",
          "items-center": align === "center",
          "items-end": align === "bottom",
          "items-start": align === "top",
          "flex-grow": grow,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
