import { PropsWithChildren } from "react";

export default function ChatLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      {children}
    </div>
  );
}
