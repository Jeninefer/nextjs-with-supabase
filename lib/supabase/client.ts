// filepath: /lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side client for API routes
export function createServerClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Update user password with AI Toolkit tracing
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  
  console.log('🔍 [AI Toolkit Trace] Supabase password update', {
    timestamp: new Date().toISOString(),
    operation: 'supabase_password_update',
    platform: 'abaco_financial_intelligence'
  })

  return await supabase.auth.updateUser({ password: newPassword })
}
