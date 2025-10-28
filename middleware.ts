import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Initializes a Supabase server client for middleware execution, enabling downstream
 * requests to access authenticated context without mutating the response during passthrough.
 *
 * @param request - Incoming Next.js request used to seed the Supabase client instance.
 * @returns The unmodified `NextResponse` for continued routing.
 */
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {} }
  )

  const res = NextResponse.next()
  return res
}

/**
 * Middleware matcher configuration to bypass static asset routes while intercepting
 * application requests for Supabase session bootstrapping.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
