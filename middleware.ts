import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Update session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  await updateSession(request);

  // Apply Content Security Policy to all routes except API
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = String.raw`
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replaceAll(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  return new Response(null, {
    status: 200,
    headers: requestHeaders,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
