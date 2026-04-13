import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "sbp_access";

export function middleware(request: NextRequest) {
  const configuredPassword = process.env.SITE_PASSWORD;
  if (!configuredPassword) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const isAccessPage = pathname === "/access";
  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === "1";

  if (isAccessPage && hasAccess) {
    const next = request.nextUrl.searchParams.get("next");
    const target = next && next.startsWith("/") ? next : "/";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!isAccessPage && !hasAccess) {
    const accessUrl = new URL("/access", request.url);
    accessUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(accessUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|access|api/access).*)"],
};

