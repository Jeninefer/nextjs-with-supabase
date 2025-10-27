import { createClient } from './supabase-client';

type BrowserClient = ReturnType<typeof createClient>;

type ServerClient = BrowserClient;

export function createBrowserClient(): BrowserClient {
  return createClient();
}

export function createServerClient(): ServerClient {
  return createClient();
}
