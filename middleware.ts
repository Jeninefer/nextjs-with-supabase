import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Initializes a Supabase server client that bridges cookies between the incoming request and outgoing response, then performs a lightweight auth check.
 *
 * If Supabase environment variables are missing, returns the response unchanged. Any error during the auth check is logged but does not stop request processing.
 *
 * @returns A NextResponse for the request, potentially updated with authentication-related cookies.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  type CookieOptions = Parameters<typeof response.cookies.set>[2];

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string) {
        response.cookies.delete(name);
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.warn("Supabase middleware auth check failed", error);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};