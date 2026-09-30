import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const authPaths = ["/login", "/register", "/verify-register"];
const adminLoginPath = "/tdibmkr/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (authPaths.includes(pathname)) {
    const token = await getToken({ req: request });
    if (token && token.status !== "UNVERIFIED") {
      return NextResponse.redirect(new URL("/merchant", request.url));
    }
  }

  if (pathname === adminLoginPath) {
    const token = await getToken({ req: request });
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/tdibmkr", request.url));
    }
  }

  if (pathname.startsWith("/tdibmkr") && pathname !== adminLoginPath) {
    const token = await getToken({ req: request });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(adminLoginPath, request.url));
    }
  }

  if (pathname.startsWith("/merchant")) {
    const token = await getToken({ req: request });
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/tdibmkr", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
