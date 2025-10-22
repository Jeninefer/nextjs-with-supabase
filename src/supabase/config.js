/**
 * Supabase Configuration
 *
 * This file contains the configuration for connecting to Supabase.
 * Environment variables are loaded via dotenv-webpack.
 */

const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
};

// Validate configuration
export function validateSupabaseConfig() {
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes("your-project-id")) {
    console.warn("⚠️ Supabase URL is not configured. Please set SUPABASE_URL in your .env file.");
    return false;
  }

  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes("your-anon-key")) {
    console.warn(
      "⚠️ Supabase Anon Key is not configured. Please set SUPABASE_ANON_KEY in your .env file."
    );
    return false;
  }

  return true;
}

export default SUPABASE_CONFIG;
