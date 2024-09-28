"use client";

import classNames from "classnames";
import Link from "next/link";
import { Inline } from "./inline";
import { Stack } from "./stack";
import { TextInput } from "./text-input";
import { faMugHot } from "@fortawesome/free-solid-svg-icons/faMugHot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface TopNavigationProps {
  className?: string;
  breadcrumbs?: Array<{ loading: true } | Breadcrumb>;
  headingSize?: "3xl";
  tabs?: {
    current?: string;
    options: Array<{
      key: string;
      label: string;
      href: string;
    } | null>;
    basePath?: string;
  };
}

export function Navigation({ className, breadcrumbs }: TopNavigationProps) {
  return (
    <Stack gap={4} className={classNames(className)}>
      {breadcrumbs && (
        <Inline justify="right" align="center">
          {breadcrumbs.map((breadcrumb, index) => {
            if ("loading" in breadcrumb) {
              return (
                <TextInput
                  key={index}
                  value="Loading"
                  color="inverted-light"
                  className="text-sm"
                  as="span"
                />
              );
            }
            return (
              <Inline key={index} gap={1}>
                <Link key={index} href={breadcrumb.href}>
                  <FontAwesomeIcon
                    icon={faMugHot}
                    size="lg"
                    style={{ color: "#3A3226" }}
                  />
                  <TextInput
                    value={breadcrumb.label}
                    className="text-sm hover:text-gray-500 transition-colors justify-right mr-2 ml-2"
                    as="span"
                  />
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <div className="text-sm text-brand-300 justify-right">/</div>
                )}
              </Inline>
            );
          })}
        </Inline>
      )}
    </Stack>
  );
}
