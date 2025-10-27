import { JsonApiClient, type ApiClientOptions } from "@/api/http-client";

const DEFAULT_OPENAI_BASE_URL = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_DEFAULT_MODEL ?? "gpt-4-turbo";

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
}

export interface ChatCompletionChoice {
  index: number;
  finish_reason?: string;
  message: {
    role: ChatRole;
    content: string;
  };
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatCompletionUsage;
}

interface BaseRequestOptions {
  apiKey?: string;
  baseUrl?: string;
  signal?: AbortSignal;
  fetchImpl?: ApiClientOptions["fetchImpl"];
}

export interface ChatCompletionOptions extends BaseRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
  tools?: Array<Record<string, unknown>>;
}

export interface CompletionResult {
  content: string;
  response: ChatCompletionResponse;
}

function sanitizeJson(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function removeUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null),
  ) as T;
}

function createClient(options: BaseRequestOptions = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to call the OpenAI API.");
  }

  return new JsonApiClient({
    baseUrl: options.baseUrl ?? DEFAULT_OPENAI_BASE_URL,
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
    model: options.model ?? DEFAULT_OPENAI_MODEL,
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

  const primaryMessage = response.choices.at(0)?.message?.content ?? "";
  return { content: primaryMessage, response };
}

export async function analyzeFigmaDesign(
  designData: unknown,
  instructions: string,
  options: ChatCompletionOptions = {},
): Promise<CompletionResult> {
  const context = sanitizeJson(designData);
  const response = await chatCompletion(
    [
      {
        role: "system",
        content: "You are an expert product designer who evaluates Figma documents.",
      },
      {
        role: "user",
        content: `Follow these instructions when reviewing the Figma data.\nInstructions: ${instructions}\n\nFigma JSON:\n${context}`,
      },
    ],
    {
      ...options,
      responseFormat: options.responseFormat ?? { type: "json_object" },
    },
  );

  const summary = response.choices.at(0)?.message?.content ?? "";
  return { content: summary, response };
}

export async function generateSlideContent(
  topic: string,
  startSlide: number,
  endSlide: number,
  options: ChatCompletionOptions = {},
): Promise<CompletionResult> {
  const response = await chatCompletion(
    [
      {
        role: "system",
        content: "You create concise presentation outlines in Markdown format.",
      },
      {
        role: "user",
        content: `Create slide content for a presentation on "${topic}" spanning slides ${startSlide} to ${endSlide}. Include key bullet points for each slide.`,
      },
    ],
    {
      ...options,
      responseFormat: options.responseFormat ?? { type: "text" },
    },
  );

  const outline = response.choices.at(0)?.message?.content ?? "";
  return { content: outline, response };
}

export const openai = {
  chatCompletion,
  complete,
  analyzeFigmaDesign,
  generateSlideContent,
};
