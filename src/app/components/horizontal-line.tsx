import React from "react";
import classNames from "classnames";

export interface HorizontalLineProps {
  thickness?: number;
  color?: string;
  className?: string;
}

export function HorizontalLine({ thickness = 2, color }: HorizontalLineProps) {
  return (
    <div
      className={classNames("border-t-1 border-b-1 border-gray-800")}
      style={{
        borderBottomWidth: `${thickness}px`,
        borderBottomColor: `${color}`,
      }}
    />
  );
}
