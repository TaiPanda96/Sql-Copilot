import { NextRequest, NextResponse } from "next/server";

/**
 * Custom middleware to authenticate the user.
 * From the cookies, the access token is extracted and decoded.
 * If the access token is not found or invalid, the user is redirected to the home page.
 * If the access token is valid, the user is redirected to the verify & create API route.
 */
export async function middleware(req: NextRequest) {
  const cookies = req.cookies;
  const accessToken = cookies.get("access_token");
  /**
   * Kinde is sending the access token in the cookie.
   * If the access token is not found, redirect the user to the home page.
   */
  if (!accessToken) {
    console.warn("User is not authenticated.");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If the user is authenticated, redirect to the verify & create API route
  console.log("Redirecting to /api/user/verify");
  return NextResponse.redirect(new URL("/api/user/verify", req.url));
}

/**
 * The matcher config is used to match the request path
 * and determine if the middleware should be executed.
 */
export const config = {
  // /chat is the path that the middleware will be executed on
  matcher: ["/chat"],
};
