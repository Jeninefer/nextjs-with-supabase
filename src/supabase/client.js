/**
 * Supabase Client
 * 
 * Initializes and exports the Supabase client for use throughout the application.
 * Import this module wherever you need to interact with Supabase.
 * 
 * Example usage:
 *   import { supabase } from './supabase/client';
 *   const { data, error } = await supabase.from('table_name').select('*');
 */

import { createClient } from '@supabase/supabase-js';
import SUPABASE_CONFIG, { validateSupabaseConfig } from './config';

let supabaseClient = null;

/**
 * Get or create the Supabase client instance
 * @returns {Object} Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!validateSupabaseConfig()) {
      console.error('❌ Supabase is not properly configured. Check your .env file.');
      return null;
    }
    
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    
    console.log('✅ Supabase client initialized');
  }
  
  return supabaseClient;
}

// Export the client instance
export const supabase = getSupabaseClient();

// Export helper functions for common operations

/**
 * Check if Supabase is properly configured
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return validateSupabaseConfig() && supabase !== null;
}

/**
 * Test the Supabase connection
 * @returns {Promise<boolean>}
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      // Table doesn't exist, but connection works
      console.log('✅ Supabase connection successful');
      return true;
    }
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err.message);
    return false;
  }
}

export default supabase;
