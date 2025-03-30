"use client";

import { LogoutLink, useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { PageContainer } from "@sql-copilot/lib/components/page-container";
import { Text } from "@sql-copilot/lib/components/text";
import { redirect } from "next/navigation";
import "../rainbow.css";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "@sql-copilot/lib/components/loading-circle";
import QuickChartContainer from "./components/quick-chart-container";

export default function VisualizationPage() {
  const { user, isLoading } = useKindeAuth();

  if (isLoading) {
    return (
      <PageContainer className="bg-[#424242] flex-col flex items-center">
        <Skeleton className="bg-[#424242] flex-col flex items-center">
          <LoaderCircle />
        </Skeleton>
      </PageContainer>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <PageContainer className="bg-[#424242] flex-col flex items-center">
      <div className="fixed top-0 right-0 p-4">
        <LogoutLink>
          <Text value="Logout" size="md" color="inverted-light" />
        </LogoutLink>
      </div>
      <QuickChartContainer user={user} />
    </PageContainer>
  );
}
