import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle refresh token errors gracefully
    if (error && error.message.includes("refresh_token_not_found")) {
      console.log("🔄 Middleware: Refresh token error detected, clearing cookies");

      // Clear auth cookies
      const authCookies = ["sb-access-token", "sb-refresh-token"];
      authCookies.forEach((cookieName) => {
        supabaseResponse.cookies.delete(cookieName);
      });

      // Only redirect to login if on a protected route
      if (
        !request.nextUrl.pathname.startsWith("/auth") &&
        !request.nextUrl.pathname.startsWith("/unauthorized") &&
        !request.nextUrl.pathname.startsWith("/api") &&
        request.nextUrl.pathname !== "/"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/v1/login";
        url.searchParams.set("error", "session_expired");
        return NextResponse.redirect(url);
      }
    } else if (
      !user &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/unauthorized") &&
      !request.nextUrl.pathname.startsWith("/api") &&
      request.nextUrl.pathname !== "/"
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone();
      url.pathname = "/auth/v1/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Middleware auth error:", error);

    // On any other auth error, if it's a protected route, redirect to login
    if (
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/unauthorized") &&
      !request.nextUrl.pathname.startsWith("/api") &&
      request.nextUrl.pathname !== "/"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/v1/login";
      url.searchParams.set("error", "auth_error");
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse;
}
