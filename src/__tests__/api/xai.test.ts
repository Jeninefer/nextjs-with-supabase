import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { chatCompletion, complete, test as testConnection } from "@/api/xai";
import { createJsonResponse, restoreFetchMock, useFetchMock } from "@/__tests__/api/test-utils";

const baseResponse = {
  id: "cmp_xai",
  object: "chat.completion",
  created: 1700000001,
  model: "grok-2-1212",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "Response from Grok",
      },
    },
  ],
};

describe("xai", () => {
  beforeEach(() => {
    process.env.XAI_API_KEY = "xai-key";
  });

  afterEach(() => {
    delete process.env.XAI_API_KEY;
    restoreFetchMock();
  });

  it("sends chat requests to the xAI endpoint", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(baseResponse));

    const result = await chatCompletion([
      {
        role: "user",
        content: "Hello Grok",
      },
    ]);

    expect(result.choices[0].message.content).toBe("Response from Grok");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.x.ai/v1/chat/completions");
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer xai-key");
  });

  it("proxies complete through chatCompletion", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(baseResponse));

    const { content } = await complete("Share tech news");
    expect(content).toBe("Response from Grok");
  });

  it("provides a simple connectivity helper", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(baseResponse));

    await testConnection();
    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.messages[0].content).toContain("Test connectivity");
  });

  it("throws when the xAI key is missing", async () => {
    delete process.env.XAI_API_KEY;
    useFetchMock();

    await expect(
      chatCompletion([
        {
          role: "user",
          content: "Hello",
        },
      ]),
    ).rejects.toThrow(/XAI_API_KEY/);
  });
});
