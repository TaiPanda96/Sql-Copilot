import classNames from "classnames";
import { Inline } from "./inline";
import { Stack } from "./stack";

interface SectionCardProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  titleLeft?: boolean;
  titleRight?: boolean;
  image?: string;
  description?: string;
}

export function SectionCard({
  children,
  title,
  titleLeft,
  titleRight,
  className,
}: SectionCardProps) {
  return (
    <Stack
      className={classNames(
        "rounded",
        "px-4",
        "py-6",
        "shadow-md brown-shadow",
        className
      )}
      gap={5}
    >
      {(title || titleRight) && (
        <Inline>
          {title && (
            <h2
              className={classNames(
                `text-2xl font-semibold`,
                titleLeft ? `text-left` : `text-center`,
                className
              )}
            >
              {title}
            </h2>
          )}
          {titleRight && (
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          )}
        </Inline>
      )}
      {children}
    </Stack>
  );
}
