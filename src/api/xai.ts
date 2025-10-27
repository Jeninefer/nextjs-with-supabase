import { JsonApiClient } from "@/api/http-client";
import type { ChatCompletionOptions, ChatCompletionResponse, ChatMessage, CompletionResult } from "@/api/openai";

const DEFAULT_XAI_BASE_URL = process.env.XAI_API_URL ?? "https://api.x.ai/v1";
const DEFAULT_XAI_MODEL = process.env.XAI_DEFAULT_MODEL ?? "grok-2-1212";

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null),
  ) as T;
}

function createClient(options: ChatCompletionOptions = {}) {
  const apiKey = options.apiKey ?? process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is required to call the xAI API.");
  }

  return new JsonApiClient({
    baseUrl: options.baseUrl ?? DEFAULT_XAI_BASE_URL,
    defaultHeaders: {
      Authorization: `Bearer ${apiKey}`,
    },
    fetchImpl: options.fetchImpl,
  });
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
): Promise<ChatCompletionResponse> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("chatCompletion requires at least one message.");
  }

  const client = createClient(options);
  const payload = removeUndefined({
    model: options.model ?? DEFAULT_XAI_MODEL,
    messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    response_format: options.responseFormat,
    tools: options.tools,
  });

  return client.post<typeof payload, ChatCompletionResponse>("chat/completions", payload, {
    signal: options.signal,
  });
}

export async function complete(prompt: string, options: ChatCompletionOptions = {}): Promise<CompletionResult> {
  const response = await chatCompletion(
    [
      {
        role: "user",
        content: prompt,
      },
    ],
    options,
  );

  const content = response.choices.at(0)?.message?.content ?? "";
  return { content, response };
}

export async function test(options: ChatCompletionOptions = {}): Promise<CompletionResult> {
  return complete("Test connectivity", options);
}

export const xai = {
  chatCompletion,
  complete,
  test,
};
