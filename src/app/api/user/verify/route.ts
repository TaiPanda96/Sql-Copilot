import { NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import { createContext } from "@sql-copilot/lib/create-context";

/**
 * This route is used to verify the user's email and create a user in the database if the user does not exist.
 * The user is redirected to the chat page after the user is verified.
 */
export async function POST(request: NextApiRequest) {
  const ctx = await createContext(["prisma"]);
  const { isAuthenticated, getUser } = getKindeServerSession(request);

  const isAuthorizedUser = await isAuthenticated();

  if (!isAuthorizedUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const user = await getUser();
  if (!user || !user.email) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const existingCopilotUser = await ctx.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingCopilotUser) {
      await ctx.prisma.user.create({
        data: {
          email: user.email,
          name: user.given_name ? user.given_name : undefined,
        },
      });
    }
    // Do not redirect to the chat page, as the user will be redirected to the chat page after the user is verified.
    return NextResponse.next();
  } catch (error) {
    console.error("User verification and creation failed:", error);
    const errorMessage = error as ApiAuthenticationError;
    return NextResponse.json(
      { success: false, error: errorMessage.message },
      { status: 401 }
    );
  }
}

class ApiAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthenticationError";
  }
}
