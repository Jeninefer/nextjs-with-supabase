import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Enforces authentication by redirecting unauthenticated requests to the sign-in page and returns a response with Supabase auth cookies synchronized.
 *
 * @param request - The incoming Next.js request used to read cookies and determine the requested pathname.
 * @returns A `NextResponse` that continues the request with Supabase authentication cookies applied or a redirect response to `/sign-in` for unauthenticated accesses to protected routes.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/sign-in') && 
      !request.nextUrl.pathname.startsWith('/sign-up') && 
      !request.nextUrl.pathname.startsWith('/auth') && 
      request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}