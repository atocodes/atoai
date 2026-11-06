import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const adminUrl = process.env.ADMIN_URL?.trim().replace(/\/+$/, "");
  const baseUrl = process.env.BASE_URL?.trim().replace(/\/+$/, "");

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    adminUrl,
    baseUrl,
  ].filter(Boolean) as string[];

  const normalizedOrigin = origin.replace(/\/+$/, "");
  const isAllowed =
    allowedOrigins.includes(normalizedOrigin) ||
    normalizedOrigin.startsWith("http://localhost:");

  // Handle preflight OPTIONS
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    return response;
  }

  const response = NextResponse.next();
  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};

export const middleware = proxy;

