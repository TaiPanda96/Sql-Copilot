import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@sql-copilot/lib/components/button";
import { PageContainer } from "@sql-copilot/lib/components/page-container";
import { Stack } from "@sql-copilot/lib/components/stack";
import "./rainbow.css";
import { BrownianLine } from "@sql-copilot/lib/components/brownian-line";

export default async function Page() {
  return (
    <PageContainer className="min-h-screen bg-[#424242] flex items-center justify-center">
      <Stack gap={4} align="center">
        <h1 className="rainbow-text text-[40px] leading-tight font-semibold text-center text-gray-900">
          Build beautiful charts with AI
        </h1>
        <BrownianLine />
        <LoginLink>
          <Button
            label="Get Started"
            className="rounded text-white"
            color="brand"
            variant="ghost"
          />
        </LoginLink>
      </Stack>
    </PageContainer>
  );
}
