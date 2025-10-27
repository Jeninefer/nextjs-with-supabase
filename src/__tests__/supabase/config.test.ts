import { describe, expect, it } from "vitest";

import { getSupabaseBrowserConfig, getSupabaseServiceConfig, hasSupabaseEnvVars } from "@/supabase/config";

describe("supabase/config", () => {
  it("reads the browser configuration from an environment object", () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "anon-key",
    };

    const config = getSupabaseBrowserConfig(env);
    expect(config).toEqual({ url: "https://example.supabase.co", anonKey: "anon-key" });
  });

  it("throws when required values are missing", () => {
    expect(() => getSupabaseBrowserConfig({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("returns the service role configuration", () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    };

    const config = getSupabaseServiceConfig(env);
    expect(config).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
      serviceRoleKey: "service-role",
    });
  });

  it("detects when supabase environment variables are configured", () => {
    expect(
      hasSupabaseEnvVars({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "anon-key",
      }),
    ).toBe(true);
    expect(hasSupabaseEnvVars({})).toBe(false);
  });
});
