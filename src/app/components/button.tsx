import React, { ReactNode } from "react";
import classNames from "classnames";
import { Inline } from "./inline";
import { TextInput } from "./text-input";

interface ButtonProps {
  children?: ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

export function Button({ title, children, className, onClick }: ButtonProps) {
  return (
    <button
      className={classNames(
        "flex",
        "rounded-full",
        "justify-center",
        "border-gray",
        "transition-colors",
        "px-16",
        "py-3",
        "mt-2",
        "text-sm",
        "font-semibold",
        className
      )}
      type="button"
      onClick={onClick}
    >
      <Inline gap={8}>
        <Inline align="center">
          <TextInput value={title} color="regular" as="span" bold nowrap />
        </Inline>
        {children}
      </Inline>
    </button>
  );
}
