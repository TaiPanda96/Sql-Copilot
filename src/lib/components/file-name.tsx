import { FileIcon } from "lucide-react";
import { Inline } from "./inline";
import { cn } from "shadcn/lib/utils";

export interface FileNameDisplayProps {
  url: string;
  className?: string;
}

export function FileNameDisplay({ url, className }: FileNameDisplayProps) {
  return (
    <Inline gap={2} align="center">
      <FileIcon className="w-5 h-5 text-gray-600" />
      <span className={cn("text-sm", "text-gray-600", "truncate", className)}>
        {url.split("/").pop()}
      </span>
    </Inline>
  );
}
