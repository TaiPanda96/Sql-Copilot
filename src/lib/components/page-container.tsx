import classNames from "classnames";
import { Stack } from "./stack";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string; // Custom additional styles
  maxWidth?: string; // Maximum width for content
  padding?: string; // Padding inside the container
  centerVertically?: boolean; // Option to center content vertically
  fullHeight?: boolean; // Option to make the container span full height
  pageTitle?: {
    text: string; // Title text
    level?: "h1" | "h2" | "h3"; // Heading level
    className?: string; // Custom class for styling the title
  };
  contentContainerClassName?: string; // Custom class for styling the content container
}

export function PageContainer({
  children,
  className,
  maxWidth = "max-w-screen-lg", // Default max width for responsiveness
  padding = "p-6", // Default internal padding
  centerVertically = true, // Center content vertically by default
  fullHeight = true, // Full viewport height by default
  pageTitle, // Optional title
  contentContainerClassName, // Optional custom class for content
}: PageContainerProps) {
  return (
    <div
      className={classNames(
        "flex", // Flexbox for alignment
        "justify-center", // Horizontally center content
        centerVertically && "items-center", // Optionally vertically center
        fullHeight && "min-h-screen", // Full viewport height if enabled
        "overflow-hidden", // Prevent overflowing
        padding, // Internal padding
        className // Allow additional custom styles
      )}
    >
      <div
        className={classNames(
          "rounded-lg", // Rounded corners
          maxWidth, // Responsive max width
          "w-full", // Full width up to max width
          contentContainerClassName
        )}
      >
        <Stack
          gap={6}
          className="
            flex flex-col
            p-4
            w-full
            h-full
        "
        >
          {pageTitle && (
            <div className="text-center">
              {pageTitle.level === "h2" ? (
                <h2
                  className={classNames(
                    "text-3xl font-semibold",
                    pageTitle.className
                  )}
                >
                  {pageTitle.text}
                </h2>
              ) : pageTitle.level === "h3" ? (
                <h3
                  className={classNames(
                    "text-2xl font-medium",
                    pageTitle.className
                  )}
                >
                  {pageTitle.text}
                </h3>
              ) : (
                <h1
                  className={classNames(
                    "text-4xl font-bold",
                    pageTitle.className
                  )}
                >
                  {pageTitle.text}
                </h1>
              )}
            </div>
          )}
          {children}
        </Stack>
      </div>
    </div>
  );
}
