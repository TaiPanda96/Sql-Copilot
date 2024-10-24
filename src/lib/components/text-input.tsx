import classnames from "classnames";
import { ReactNode, createElement } from "react";
import styles from "./styles.module.css";

export interface TextProps {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  bold?: boolean;
  color?:
    | "regular"
    | "light"
    | "inverted"
    | "inverted-light"
    | "inherit"
    | "error"
    | "brand";
  nowrap?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  value: string | ReactNode;
  className?: string;
  italic?: boolean;
  underline?: boolean;
  indent?: number;
}

export function TextInput({
  as = "span",
  bold = false,
  color = "regular",
  nowrap = false,
  size = "md",
  value,
  className,
  italic = false,
  underline = false,
  indent = 0,
}: TextProps) {
  return createElement(
    as as string,
    {
      className: classnames(
        styles[`text-${size}`],
        "inline-block",
        {
          "text-gray-100": color === "light",
          "text-white": color === "inverted",
          "text-gray-400": color === "inverted-light",
          "text-red-600": color === "error",
          "text-brand-600": color === "brand",
          "whitespace-nowrap": nowrap,
          "font-medium": bold,
          italic,
          underline,
          indent: indent > 0 ? `ml-${indent * 50}` : 0,
        },
        className
      ),
    },
    value
  );
}
