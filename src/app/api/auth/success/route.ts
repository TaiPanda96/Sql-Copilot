import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createContext } from "@sql-copilot/lib/create-context";

export async function GET() {
  const ctx = await createContext(["prisma"]);
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return NextResponse.redirect(`${process.env.KINDE_SITE_URL}`);
  }

  const user = await getUser();
  if (!user || !user.email) {
    return NextResponse.redirect(`${process.env.KINDE_SITE_URL}`);
  }

  try {
    let existingUser = await ctx.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await ctx.prisma.user.create({
        data: {
          email: user.email,
          name: user.given_name || undefined,
        },
      });
    }

    return NextResponse.redirect(`${process.env.KINDE_SITE_URL}/visualization`);
  } catch (error) {
    console.error("User verification and creation failed:", error);
    const authError = error as ApiAuthenticationError;
    return NextResponse.json(
      { success: false, error: authError.message },
      { status: 500 }
    );
  }
}

class ApiAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthenticationError";
  }
}
