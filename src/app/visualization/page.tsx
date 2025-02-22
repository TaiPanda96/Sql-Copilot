"use client";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { PageContainer } from "@sql-copilot/lib/components/page-container";
import { Text } from "@sql-copilot/lib/components/text";
import Visualization from "@sql-copilot/lib/components/visualization";
import "../rainbow.css";

export default async function VisualizationPage() {
  return (
    <PageContainer className="min-h-screen bg-[#faf9f6]">
      <div className="fixed top-0 right-0 p-4">
        <LogoutLink>
          <Text value="Logout" size="md" color="brand" />
        </LogoutLink>
      </div>
      <h1 className="rainbow-text text-[40px] leading-tight font-semibold text-center text-gray-900">
        Let's Dive Deep Into Your Data
      </h1>
      <Visualization />
    </PageContainer>
  );
}
