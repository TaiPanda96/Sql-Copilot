import classNames from "classnames";
import { HorizontalLineProps } from "./horizontal-line";

export function VerticalLine({
  thickness = 2,
  className,
  color,
}: HorizontalLineProps) {
  return (
    <div
      className={classNames("border-r", `${color}`)}
      style={{
        borderRightWidth: `${thickness}px`,
        borderRightColor: `${color}`,
      }}
    />
  );
}
