import classNames from "classnames";
import { Stack } from "./stack";
import { Inline } from "./inline";

interface SectionCardProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  titleLeft?: boolean;
  titleRight?: boolean;
  image?: string;
  description?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export function SectionCard({
  children,
  title,
  titleLeft,
  titleRight,
  className,
  actions,
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
      {actions && (
        <Inline gap={2}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={classNames(
                "text-sm",
                "font-semibold",
                "text-gray-600",
                "hover:text-gray-900",
                "transition-colors",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-gray-500",
                "focus-visible:ring-opacity-50"
              )}
            >
              {action.label}
            </button>
          ))}
        </Inline>
      )}
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
