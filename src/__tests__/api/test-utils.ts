import { vi } from "vitest";

export function createJsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

export function useFetchMock() {
  const mock = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
  vi.stubGlobal("fetch", mock as unknown as typeof fetch);
  return mock;
}

export function restoreFetchMock() {
  vi.unstubAllGlobals();
}
