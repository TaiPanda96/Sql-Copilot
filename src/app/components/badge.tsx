import classNames from "classnames";
import { TextInput } from "./text-input";
import Link from "next/link";

export interface BadgeProps {
  className?: string;
  label?: string;
  size: "sm" | "md" | "lg";
  rounded?: boolean;
  href?: string;
}

export function Badge({
  label,
  size,
  rounded,
  href,
}: React.PropsWithChildren<BadgeProps>) {
  return (
    <div>
      {href ? (
        <Link
          className={classNames(
            "bg-blend-color-dodge",
            "px-16",
            "py-3",
            rounded ? `rounded-sm` : ``
          )}
          href={href}
        >
          <TextInput
            value={label || "Label"}
            color="regular"
            as="span"
            size={size}
            bold
          />
        </Link>
      ) : (
        <TextInput
          className={classNames(`bg-white`, "px-5", "py-2", "rounded-sm")}
          value={label || "Label"}
          color="regular"
          as="span"
          size={size}
          bold
          nowrap
        />
      )}
    </div>
  );
}
