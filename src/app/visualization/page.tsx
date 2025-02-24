"use client";

import { LogoutLink, useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { PageContainer } from "@sql-copilot/lib/components/page-container";
import { Text } from "@sql-copilot/lib/components/text";
import { redirect } from "next/navigation";
import "../rainbow.css";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "@sql-copilot/lib/components/loading-circle";
import ChatInterface from "@sql-copilot/lib/components/chat-interface";

export default function VisualizationPage() {
  const { user, isLoading } = useKindeAuth();

  if (isLoading) {
    return (
      <Skeleton>
        <LoaderCircle />
      </Skeleton>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <PageContainer className="min-h-screen bg-[#faf9f6]">
      <div className="fixed top-0 right-0 p-4">
        <LogoutLink>
          <Text value="Logout" size="md" color="brand" />
        </LogoutLink>
      </div>
      <ChatInterface user={user} />
    </PageContainer>
  );
}
