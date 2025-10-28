import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type NormalizedCookieOptions = {
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
};

const normalizeCookieOptions = (
  options?: CookieOptions,
): NormalizedCookieOptions | undefined => {
  if (!options) {
    return undefined;
  }

  const normalized: NormalizedCookieOptions = {};

  if (options.domain) normalized.domain = options.domain;
  if (options.path) normalized.path = options.path;
  if (options.expires instanceof Date) normalized.expires = options.expires;
  if (typeof options.maxAge === "number") normalized.maxAge = options.maxAge;
  if (options.sameSite) normalized.sameSite = options.sameSite as NormalizedCookieOptions["sameSite"];
  if (options.httpOnly !== undefined) normalized.httpOnly = options.httpOnly;
  if (options.secure !== undefined) normalized.secure = options.secure;

  return normalized;
};

const applyCookie = (
  response: NextResponse,
  name: string,
  value: string,
  options?: CookieOptions,
) => {
  const normalized = normalizeCookieOptions(options);
  if (normalized) {
    response.cookies.set({ name, value, ...normalized });
  } else {
    response.cookies.set(name, value);
  }
};

const removeCookie = (
  response: NextResponse,
  name: string,
  options?: CookieOptions,
) => {
  const normalized = normalizeCookieOptions(options);
  if (normalized) {
    response.cookies.delete({ name, ...normalized });
  } else {
    response.cookies.delete(name);
  }
};

/**
 * Initializes a Supabase server client that bridges cookies between the incoming request and outgoing response, then performs a
 * lightweight auth check.
 *
 * If Supabase environment variables are missing, returns the response unchanged.
 * Any error during the auth check is logged but does not stop request processing.
 *
 * @returns A NextResponse for the request, potentially updated with authentication-related cookies.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase middleware: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Authentication checks will be skipped.",
    );
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options?: CookieOptions) => {
          applyCookie(response, name, value, options);
        },
        remove: (name: string, options?: CookieOptions) => {
          removeCookie(response, name, options);
        },
      },
    });

    await supabase.auth.getSession();
  } catch (err) {
    console.error("Supabase middleware error:", err);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
