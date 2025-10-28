import {
  createServerClient,
  type CookieMethodsServer,
  type CookieMethodsServerDeprecated,
  type CookieOptions
} from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ensureEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const cookieAdapter: CookieMethodsServer & CookieMethodsServerDeprecated = {
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    getAll() {
      return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
    },
    set(name: string, value: string, options: CookieOptions) {
      response.cookies.set({ name, value, ...options })
    },
    setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
      cookies.forEach(({ name, value, options }) => {
        response.cookies.set({ name, value, ...options })
      })
    },
    remove(name: string, options: CookieOptions) {
      response.cookies.set({ name, value: '', maxAge: 0, ...options })
    }
  }

  const supabase = createServerClient(
    ensureEnv('NEXT_PUBLIC_SUPABASE_URL'),
    ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
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
