import { NextResponse, type NextRequest } from "next/server";
import { activityCookieName, impersonationCookieName, inactiveSessionMaxAgeSeconds } from "@/lib/auth-config";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/me"];

function hasAuthSession(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasAuthSession(request);
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isExpiredLoginPage = pathname === "/login" && request.nextUrl.searchParams.get("expired") === "1";

  if (!hasSession && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && pathname === "/login" && !isExpiredLoginPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (hasSession && !isPublic) {
    const lastActivity = Number(request.cookies.get(activityCookieName)?.value ?? "0");
    const now = Date.now();

    if (lastActivity && now - lastActivity > inactiveSessionMaxAgeSeconds * 1000) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("expired", "1");

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(activityCookieName);
      response.cookies.delete(impersonationCookieName);
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.cookies.set(activityCookieName, String(now), {
      httpOnly: true,
      maxAge: inactiveSessionMaxAgeSeconds,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
