import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { analyzeFigmaDesign, chatCompletion, complete, generateSlideContent } from "@/api/openai";
import { createJsonResponse, restoreFetchMock, useFetchMock } from "@/__tests__/api/test-utils";

const defaultResponse = {
  id: "cmp_123",
  object: "chat.completion",
  created: 1700000000,
  model: "gpt-4-turbo",
  choices: [
    {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content: "Hello!",
      },
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
};

describe("openai", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    restoreFetchMock();
  });

  it("sends chat completion requests with the expected payload", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(defaultResponse));

    const result = await chatCompletion([
      {
        role: "user",
        content: "Hello",
      },
    ]);

    expect(result.choices[0].message.content).toBe("Hello!");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init?.method).toBe("POST");
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer test-key");
    expect(headers.get("content-type")).toBe("application/json");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(body.model).toBe("gpt-4-turbo");
  });

  it("returns the primary message content from complete", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(defaultResponse));

    const { content, response } = await complete("Summarise the news");
    expect(content).toBe("Hello!");
    expect(response.choices).toHaveLength(1);
  });

  it("defaults to JSON response format when analysing Figma designs", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(defaultResponse));

    await analyzeFigmaDesign({ node: "button" }, "Identify improvements");

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages).toHaveLength(2);
  });

  it("defaults to text response format when generating slide content", async () => {
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValueOnce(createJsonResponse(defaultResponse));

    await generateSlideContent("AI in Finance", 1, 5);

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body.response_format).toEqual({ type: "text" });
  });

  it("throws an informative error when the API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const fetchMock = useFetchMock();
    fetchMock.mockResolvedValue(createJsonResponse(defaultResponse));

    await expect(
      chatCompletion([
        {
          role: "user",
          content: "Hello",
        },
      ]),
    ).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
