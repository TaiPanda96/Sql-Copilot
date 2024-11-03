import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Stack } from "@sql-copilot/lib/components/stack";
import { Text } from "@sql-copilot/lib/components/text";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Stack gap={4}>
        <h1 className="text-4xl font-bold text-brand-600">SQL Copilot</h1>
        <h3 className="text-xl font-medium text-gray-400">SQL made easy.</h3>
        <LoginLink>
          <Text value="Login" size="md" color="brand" />
        </LoginLink>
        <RegisterLink>
          <Text value="Register" size="md" color="brand" />
        </RegisterLink>
      </Stack>
    </main>
  );
}
