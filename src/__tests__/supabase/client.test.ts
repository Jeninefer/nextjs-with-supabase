import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

let createBrowserClientMock: ReturnType<typeof vi.fn>;

describe("lib/supabase/client", () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "anon";

    const module = await import("@supabase/ssr");
    createBrowserClientMock = vi.mocked(module.createBrowserClient);
    createBrowserClientMock.mockReset();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  });

  it("creates a browser client using validated configuration", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    createBrowserClientMock.mockReturnValueOnce({} as never);

    await createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon",
    );
  });

  it("throws when configuration is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { createClient } = await import("@/lib/supabase/client");

    await expect(() => createClient()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
