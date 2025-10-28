import {
  createServerClient,
  type CookieMethodsServer,
  type CookieMethodsServerDeprecated,
  type CookieOptions
} from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ensureEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const cookieAdapter: CookieMethodsServer & CookieMethodsServerDeprecated = {
    get(name: string) {
      return request.cookies.get(name)?.value ?? null
    },
    getAll() {
      return request.cookies
        .getAll()
        .map(cookie => ({ name: cookie.name, value: cookie.value }))
    },
    set(name: string, value: string, options: CookieOptions = {}) {
      response.cookies.set({ name, value, ...options })
    },
    remove(name: string, options: CookieOptions = {}) {
      response.cookies.delete({ name, ...options })
    },
    setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
      for (const cookie of cookies) {
        response.cookies.set({ name: cookie.name, value: cookie.value, ...cookie.options })
      }
    }
  }

  const supabase = createServerClient(
    ensureEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    ensureEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: cookieAdapter
    }
  )

  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
