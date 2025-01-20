import { cva, VariantProps } from "class-variance-authority";
import { isString } from "lodash";
import {
  ComponentProps,
  ElementType,
  PropsWithChildren,
  ReactNode,
} from "react";
import { Inline } from "./inline";
import { Text } from "./text";
import { cn } from "shadcn/lib/utils";

export const buttonVariants = cva(
  [
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-gray-600",
    "focus-visible:outline-offset-2",
    "rounded-md",
    "text-center",
    "flex",
    "flex-row",
    "items-center",
    "justify-center",
    "gap-2",
    "border-2",
  ],
  {
    variants: {
      variant: {
        solid: [
          "bg-gray-900",
          "text-white",
          "border-transparent",
          "hover:bg-gray-700",
        ],
        outline: [
          "bg-white",
          "text-gray-600",
          "border-gray-900",
          "hover:bg-gray-50",
        ],
        input: [
          "bg-white",
          "text-gray-600",
          "outline-0",
          "hover:bg-gray-50",
          "focus-visible:outline",
          "focus-visible:outline-2",
          "focus-visible:outline-gray-600",
          "focus-visible:outline-offset-2",
          "text-left",
        ],
        ghost: ["hover:bg-gray-300/25", "border-transparent"],
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
      loading: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
      noPadding: {
        true: "",
        false: "px-4 py-3",
      },
    },
    compoundVariants: [
      {
        disabled: false,
        loading: false,
        className: "cursor-pointer",
      },
    ],
    defaultVariants: {
      variant: "solid",
      disabled: false,
      loading: false,
      noPadding: false,
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type LocalButtonProps = ButtonVariantProps & {
  className?: string;
  iconClassName?: string;
  Icon?: ElementType;
  IconRight?: ElementType;
  /** @deprecated prefer label */
  text?: string;
  label?: string | ReactNode;
};

// All of the below is to make the Button component polymorphic while
// inheriting all the typings from from the underlying component.
type AsProp<TAs extends ElementType> = { as?: TAs };

type PropsToOmit<TAs extends ElementType, P> = keyof (AsProp<TAs> & P);

type PolymorphicComponentProp<
  TAs extends ElementType,
  Props = object
> = PropsWithChildren<Props & AsProp<TAs>> &
  Omit<ComponentProps<TAs>, PropsToOmit<TAs, Props>>;

export type ButtonProps<TAs extends ElementType = "button"> =
  PolymorphicComponentProp<TAs, LocalButtonProps>;

export function Button<TAs extends ElementType = "button">({
  as,
  className,
  iconClassName,
  disabled = false,
  Icon,
  IconRight,
  loading = false,
  noPadding = false,
  text,
  label = text,
  variant = "solid",
  ...props
}: ButtonProps<TAs>) {
  const Component = as || "button";

  return (
    <Component
      className={cn(
        buttonVariants({ disabled, loading, noPadding, variant }),
        className
      )}
      disabled={(disabled || loading) ?? false}
      type="button"
      {...props}
    >
      <Inline gap={2} justify="center" className="w-full">
        {Icon && (
          <Icon
            className={cn("size-4", "-my-0.5", "flex-none", iconClassName)}
            aria-hidden="true"
          />
        )}
        {label && (
          <div className="flex flex-grow">
            {isString(label) ? (
              <Text
                value={label}
                color="inherit"
                className="w-full inline-block text-center"
              />
            ) : (
              label
            )}
          </div>
        )}
        {IconRight && (
          <IconRight className="size-4 -my-0.5 flex-none" aria-hidden="true" />
        )}
        {loading && (
          <div className="size-4 flex-none">
            <div className="loader-circle w-6 h-6 animate-spin" />
          </div>
        )}
      </Inline>
    </Component>
  );
}
