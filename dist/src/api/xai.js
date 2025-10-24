/**
 * xAI (Grok) API Client
 *
 * Integrates with xAI's Grok models.
 * Documentation: https://docs.x.ai/api
 */

const XAI_CONFIG = {
  apiKey: process.env.XAI_API_KEY,
  apiUrl: "https://api.x.ai/v1",
  model: "grok-beta",
};

/**
 * Validate xAI configuration
 */
export function validateXAIConfig() {
  if (!XAI_CONFIG.apiKey || XAI_CONFIG.apiKey.includes("your-xai-api-key")) {
    console.warn("⚠️ xAI API key is not configured. Please set XAI_API_KEY in your .env file.");
    return false;
  }
  return true;
}

/**
 * Make a request to xAI API
 */
async function xaiRequest(endpoint, data, options = {}) {
  if (!validateXAIConfig()) {
    throw new Error("xAI is not properly configured");
  }

  const url = `${XAI_CONFIG.apiUrl}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${XAI_CONFIG.apiKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`xAI API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("xAI API request failed:", error);
    throw error;
  }
}

/**
 * Chat completion with Grok
 */
export async function chatCompletion(messages, options = {}) {
  const { model = XAI_CONFIG.model, temperature = 0, stream = false } = options;

  return await xaiRequest("/chat/completions", {
    model,
    messages,
    temperature,
    stream,
  });
}

/**
 * Simple text completion helper
 */
export async function complete(
  prompt,
  systemPrompt = "You are Grok, a helpful AI assistant.",
  options = {}
) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const response = await chatCompletion(messages, options);
  return response.choices[0]?.message?.content || "";
}

/**
 * Analyze with Grok's real-time knowledge
 */
export async function analyzeWithRealTime(query) {
  const systemPrompt = `You are Grok with access to real-time information. 
Provide accurate, up-to-date analysis with sources when relevant.`;

  return await complete(query, systemPrompt);
}

/**
 * Creative writing with Grok
 */
export async function creativeWrite(topic, style = "professional") {
  const systemPrompt = `You are Grok, a creative writing assistant. 
Write in a ${style} style with wit and insight.`;

  return await complete(`Write about: ${topic}`, systemPrompt);
}

/**
 * Test xAI connection
 */
export async function test() {
  try {
    const response = await complete("Testing. Just say hi and hello world and nothing else.");
    console.log("✅ xAI (Grok) connection successful:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ xAI (Grok) connection failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * xAI service object
 */
export const xai = {
  chatCompletion,
  complete,
  analyzeWithRealTime,
  creativeWrite,
  test,
  config: XAI_CONFIG,
};

export default xai;
