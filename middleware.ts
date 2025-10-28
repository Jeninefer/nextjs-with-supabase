import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a NextResponse and a Supabase server client bridged to the incoming request's cookies,
 * initializes the Supabase auth session, and returns the response allowing the client to set or remove cookies.
 *
 * @param request - The incoming Next.js request used to read cookies for the Supabase SSR client
 * @returns A NextResponse that may contain cookies written by the Supabase SSR client
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options })
        }
      }
    }
  )

  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}