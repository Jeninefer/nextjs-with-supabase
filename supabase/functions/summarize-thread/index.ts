declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

// @ts-expect-error -- Deno runtime resolves ESM URL imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SummarizeRequest = {
  thread_id: string;
  max_messages?: number;
  model?: string;
};

type SenderRecord = {
  id: string;
  display_name: string | null;
};

type MessageRow = {
  id: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  sender: SenderRecord | SenderRecord[] | null;
};

type NormalizedPayload = {
  threadId: string;
  maxMessages: number;
  model: string;
};

type TranscriptBundle = {
  transcript: string;
  first: MessageRow;
  last: MessageRow;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const openAiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
const openAiBaseUrl = (Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("summarize-thread: Supabase credentials are not configured");
}

if (!openAiKey) {
  console.warn("summarize-thread: OPENAI_API_KEY is not set; using fallback summaries only");
}

const createScopedClient = (extraHeaders: Record<string, string> = {}) =>
  createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { "Content-Type": "application/json", ...extraHeaders } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

const serviceClient = createScopedClient();

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const okResponse = new Response("ok", { headers: corsHeaders });

type ParseResult = { payload: SummarizeRequest } | { response: Response };

const parsePayload = async (req: Request): Promise<ParseResult> => {
  try {
    return { payload: (await req.json()) as SummarizeRequest };
  } catch {
    return { response: jsonResponse(400, { error: "Invalid JSON body" }) };
  }
};

const normalizePayload = (payload: SummarizeRequest): NormalizedPayload | Response => {
  const threadId = payload.thread_id?.trim();
  if (!threadId) {
    return jsonResponse(400, { error: "thread_id is required" });
  }

  const maxMessages = Math.min(Math.max(payload.max_messages ?? 50, 1), 200);
  const model = payload.model?.trim() || "gpt-4o";

  return { threadId, maxMessages, model };
};

type MembershipResult = { profileId: string | null } | { response: Response };

const verifyMembership = async (
  header: string | null,
  threadId: string
): Promise<MembershipResult> => {
  if (!header) {
    return { profileId: null };
  }

  const [scheme, token] = header.split(" ");
  if ((scheme ?? "").toLowerCase() !== "bearer" || !token) {
    return { response: jsonResponse(401, { error: "Authorization header must use Bearer scheme" }) };
  }

  try {
    const verifyClient = createScopedClient({ Authorization: `Bearer ${token}` });
    const { data: userData, error: userError } = await verifyClient.auth.getUser(token);

    if (userError || !userData?.user) {
      return { response: jsonResponse(401, { error: "Invalid or expired token" }) };
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("summarize-thread: profile lookup failed", profileError);
      return { response: jsonResponse(500, { error: "Failed to verify profile" }) };
    }

    if (!profile?.id) {
      return { response: jsonResponse(403, { error: "Profile not found" }) };
    }

    const { data: membership, error: membershipError } = await serviceClient
      .from("thread_members")
      .select("id")
      .eq("thread_id", threadId)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("summarize-thread: membership check failed", membershipError);
      return { response: jsonResponse(500, { error: "Failed to verify membership" }) };
    }

    if (!membership) {
      return { response: jsonResponse(403, { error: "Membership required" }) };
    }

    return { profileId: profile.id };
  } catch (error) {
    console.error("summarize-thread: unexpected auth error", error);
    return { response: jsonResponse(500, { error: "Failed to verify requester" }) };
  }
};

type MessagesResult = { messages: MessageRow[] } | { response: Response };

const fetchMessages = async (
  threadId: string,
  limit: number
): Promise<MessagesResult> => {
  const { data, error } = await serviceClient
    .from("messages")
    .select(
      "id, body, metadata, created_at, sender:sender_id (id, display_name)"
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("summarize-thread: failed to load messages", error);
    return { response: jsonResponse(500, { error: "Failed to load messages" }) };
  }

  return { messages: data ?? [] };
};

const resolveSender = (sender: MessageRow["sender"]): SenderRecord | null => {
  if (Array.isArray(sender)) {
    return sender[0] ?? null;
  }
  return sender;
};

const buildTranscript = (messages: MessageRow[]): TranscriptBundle => {
  const ordered = [...messages].reverse();
  const lines = ordered
    .map((msg) => {
      const senderInfo = resolveSender(msg.sender);
      const author = senderInfo?.display_name ?? senderInfo?.id ?? "Unknown";
      const stamp = new Date(msg.created_at).toISOString();
      const body = (msg.body ?? "").replaceAll(/\s+/g, " ").trim();
      return `[${stamp}] ${author}: ${body}`;
    })
    .join("\n");

  return {
    transcript: lines,
    first: ordered[0],
    last: ordered.at(-1) ?? ordered[0],
  };
};

const summarizeWithOpenAi = async (
  threadId: string,
  transcript: string,
  model: string
): Promise<string> => {
  if (!openAiKey) {
    return "";
  }

  try {
    const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You summarize lending workspace chat threads. Return 3-5 concise bullet points and highlight action items when present.",
          },
          {
            role: "user",
            content: `Generate a succinct update for thread ${threadId}.\n\nTranscript:\n${transcript}`,
          },
        ],
      }),
    });

    if (response.ok) {
      const completion = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return completion.choices?.[0]?.message?.content?.trim() ?? "";
    }

    const errorPayload = await response.text();
    console.error("summarize-thread: OpenAI error", errorPayload);
    return "";
  } catch (error) {
    console.error("summarize-thread: OpenAI request failed", error);
    return "";
  }
};

const fallbackSummary = (
  threadId: string,
  count: number,
  first: MessageRow,
  last: MessageRow
): string => {
  const firstSnippet = (first.body ?? "n/a").slice(0, 120);
  const lastSnippet = (last.body ?? "n/a").slice(0, 120);
  return `Thread ${threadId} has ${count} messages. First topic: ${firstSnippet}. Latest update: ${lastSnippet}.`;
};

const persistSummary = async (threadId: string, summary: string): Promise<Response | null> => {
  const { error } = await serviceClient
    .from("threads")
    .update({ summary, updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (!error) {
    return null;
  }

  console.error("summarize-thread: failed to persist summary", error);
  return jsonResponse(207, { error: "Summary saved with warnings", summary });
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return okResponse;
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const parsed = await parsePayload(req);
  if ("response" in parsed) {
    return parsed.response;
  }

  const normalized = normalizePayload(parsed.payload);
  if (normalized instanceof Response) {
    return normalized;
  }

  const membership = await verifyMembership(req.headers.get("Authorization"), normalized.threadId);
  if ("response" in membership) {
    return membership.response;
  }

  const messagesResult = await fetchMessages(normalized.threadId, normalized.maxMessages);
  if ("response" in messagesResult) {
    return messagesResult.response;
  }

  const { messages } = messagesResult;
  if (messages.length === 0) {
    return jsonResponse(200, { summary: "No messages available for this thread." });
  }

  const transcript = buildTranscript(messages);
  const summary =
    (await summarizeWithOpenAi(normalized.threadId, transcript.transcript, normalized.model)) ||
    fallbackSummary(normalized.threadId, messages.length, transcript.first, transcript.last);

  const persistenceIssue = await persistSummary(normalized.threadId, summary);
  if (persistenceIssue) {
    return persistenceIssue;
  }

  return jsonResponse(200, { summary });
});
