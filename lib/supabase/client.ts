import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}

/**
 * Update user password with AI Toolkit tracing
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  
  console.log('🔍 [AI Toolkit Trace] Supabase password update', {
    timestamp: new Date().toISOString(),
    operation: 'supabase_password_update',
    platform: 'ABACO_Financial_Intelligence'
  });

  return await supabase.auth.updateUser({ password: newPassword });
}
