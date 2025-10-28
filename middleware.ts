import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfig } from "./lib/env";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () =>
        request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
