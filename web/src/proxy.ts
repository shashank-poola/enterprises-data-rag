import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/chat", "/documents", "/analytics"];
const PUBLIC_AUTH = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isPublicAuth = PUBLIC_AUTH.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicAuth && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|favicon).*)"],
};
