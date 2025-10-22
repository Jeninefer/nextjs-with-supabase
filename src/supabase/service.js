/**
 * Supabase Service
 * 
 * Helper functions for common Supabase operations.
 * This module provides easy-to-use wrappers around Supabase functionality.
 */

import { supabase, isSupabaseConfigured } from './client';

/**
 * Authentication helpers
 */
export const auth = {
  /**
   * Sign up a new user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{user, session, error}>}
   */
  async signUp(email, password) {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
    return await supabase.auth.signUp({ email, password });
  },

  /**
   * Sign in an existing user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{user, session, error}>}
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
    return await supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * Sign out the current user
   * @returns {Promise<{error}>}
   */
  async signOut() {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
    return await supabase.auth.signOut();
  },

  /**
   * Get the current user
   * @returns {Promise<{user, error}>}
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) return { user: null, error: { message: 'Supabase not configured' } };
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  /**
   * Get the current session
   * @returns {Promise<{session, error}>}
   */
  async getSession() {
    if (!isSupabaseConfigured()) return { session: null, error: { message: 'Supabase not configured' } };
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }
};

/**
 * Database helpers
 */
export const db = {
  /**
   * Select data from a table
   * @param {string} table - Table name
   * @param {string} columns - Columns to select (default: '*')
   * @returns {Promise<{data, error}>}
   */
  async select(table, columns = '*') {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.from(table).select(columns);
  },

  /**
   * Insert data into a table
   * @param {string} table - Table name
   * @param {Object|Array} data - Data to insert
   * @returns {Promise<{data, error}>}
   */
  async insert(table, data) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.from(table).insert(data).select();
  },

  /**
   * Update data in a table
   * @param {string} table - Table name
   * @param {Object} data - Data to update
   * @param {Object} match - Match conditions
   * @returns {Promise<{data, error}>}
   */
  async update(table, data, match) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.from(table).update(data).match(match).select();
  },

  /**
   * Delete data from a table
   * @param {string} table - Table name
   * @param {Object} match - Match conditions
   * @returns {Promise<{data, error}>}
   */
  async delete(table, match) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.from(table).delete().match(match);
  }
};

/**
 * Storage helpers
 */
export const storage = {
  /**
   * Upload a file to storage
   * @param {string} bucket - Bucket name
   * @param {string} path - File path in bucket
   * @param {File|Blob} file - File to upload
   * @returns {Promise<{data, error}>}
   */
  async upload(bucket, path, file) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.storage.from(bucket).upload(path, file);
  },

  /**
   * Download a file from storage
   * @param {string} bucket - Bucket name
   * @param {string} path - File path in bucket
   * @returns {Promise<{data, error}>}
   */
  async download(bucket, path) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.storage.from(bucket).download(path);
  },

  /**
   * Get public URL for a file
   * @param {string} bucket - Bucket name
   * @param {string} path - File path in bucket
   * @returns {string}
   */
  getPublicUrl(bucket, path) {
    if (!isSupabaseConfigured()) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   * @param {string} bucket - Bucket name
   * @param {string[]} paths - File paths to delete
   * @returns {Promise<{data, error}>}
   */
  async delete(bucket, paths) {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.storage.from(bucket).remove(paths);
  }
};

/**
 * Real-time helpers
 */
export const realtime = {
  /**
   * Subscribe to changes in a table
   * @param {string} table - Table name
   * @param {Function} callback - Callback function for changes
   * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', '*')
   * @returns {RealtimeChannel}
   */
  subscribe(table, callback, event = '*') {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured');
      return null;
    }
    
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event, schema: 'public', table }, callback)
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   * @param {RealtimeChannel} channel 
   */
  async unsubscribe(channel) {
    if (channel) {
      await supabase.removeChannel(channel);
    }
  }
};

export default {
  auth,
  db,
  storage,
  realtime,
};
