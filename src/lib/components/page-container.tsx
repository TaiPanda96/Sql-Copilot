import { cn } from "shadcn/lib/utils";
import { Stack } from "./stack";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
  centerVertically?: boolean;
  fullHeight?: boolean;
  pageTitle?: {
    text: string;
    level?: "h1" | "h2" | "h3";
    className?: string;
  };
  contentContainerClassName?: string;
}

export function PageContainer({
  children,
  className,
  maxWidth = "max-w-screen-xl", // Increased width for better spacing
  padding = "p-6",
  fullHeight = true,
  pageTitle,
  contentContainerClassName,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex",
        "justify-center", // Keep center for horizontal layout
        "items-start", // Align content to the top instead of centering it
        fullHeight && "min-h-screen",
        padding,
        className
      )}
    >
      <div
        className={cn(
          "rounded-lg",
          maxWidth, // Increased width to prevent squishing
          "w-full", // Ensure full width usage
          contentContainerClassName
        )}
      >
        <Stack gap={6} className="flex flex-col w-full h-full">
          {pageTitle && (
            <div className="text-center">
              {pageTitle.level === "h2" ? (
                <h2
                  className={cn("text-3xl font-semibold", pageTitle.className)}
                >
                  {pageTitle.text}
                </h2>
              ) : pageTitle.level === "h3" ? (
                <h3 className={cn("text-2xl font-medium", pageTitle.className)}>
                  {pageTitle.text}
                </h3>
              ) : (
                <h1 className={cn("text-4xl font-bold", pageTitle.className)}>
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
