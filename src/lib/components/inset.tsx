import classNames from "classnames";
import { ReactNode } from "react";
import styles from "./styles.module.css";

interface InsetProps {
  padding?: "sm" | "md" | "lg" | "xl" | "xxl";
  indentationGap?: number;
  background?: "light" | "dark" | "inverted" | "brand";
  children: ReactNode;
  className?: string;
}

export function Inset({
  padding = "md",
  background = "light",
  indentationGap: indent = 0,
  children,
  className,
}: InsetProps) {
  return (
    <div
      className={classNames(
        styles[`padding-${padding}`],
        styles[`bg-${background}`],
        className
      )}
      style={{ marginLeft: `${indent * 1}rem` }}
    >
      {children}
    </div>
  );
}
