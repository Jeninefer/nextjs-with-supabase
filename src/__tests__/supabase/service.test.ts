import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

let createClientMock: ReturnType<typeof vi.fn>;

describe("supabase/service", () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const module = await import("@supabase/supabase-js");
    createClientMock = vi.mocked(module.createClient);
    createClientMock.mockReset();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("creates a service role client with the expected credentials", async () => {
    const { createServiceRoleClient } = await import("@/supabase/service");
    createClientMock.mockReturnValueOnce({} as never);

    await createServiceRoleClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
      undefined,
    );
  });

  it("passes through client options", async () => {
    const { createServiceRoleClient } = await import("@/supabase/service");
    createClientMock.mockReturnValueOnce({} as never);

    const options = { auth: { persistSession: false } } as never;
    await createServiceRoleClient(options);

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role",
      options,
    );
  });

  it("throws when the service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { createServiceRoleClient } = await import("@/supabase/service");

    await expect(() => createServiceRoleClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});
