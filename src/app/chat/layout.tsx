import { Stack } from "@sql-copilot/lib/components/stack";
import { PropsWithChildren } from "react";

export default function ChatLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Stack gap={6} className="w-full max-w-lg">
        {children}
      </Stack>
    </div>
  );
}
