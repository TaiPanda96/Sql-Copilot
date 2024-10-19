"use client";

import { createMessageAction } from "@sql-copilot/app/chat/actions/create-chat-action";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "shadcn/components/ui/button";

interface CreateMessageActionButtonProps {
  message: string;
}

export default function SendMessageActionButton({
  message,
}: CreateMessageActionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    await createMessageAction({ message });
    router.refresh();
    setLoading(false);
  }, [message, router]);

  return loading ? (
    <Button variant="ghost" disabled />
  ) : (
    <Button variant="ghost" onClick={handleClick} className="text-white">
      Send
    </Button>
  );
}
