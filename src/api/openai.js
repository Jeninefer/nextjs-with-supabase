/**
 * OpenAI API Client
 *
 * Integrates with OpenAI's API for GPT models.
 * Documentation: https://platform.openai.com/docs/api-reference
 */

const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: "https://api.openai.com/v1",
  model: "gpt-4-turbo-preview",
};

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig() {
  if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey.includes("your-openai-api-key")) {
    console.warn(
      "⚠️ OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file."
    );
    return false;
  }
  return true;
}

/**
 * Make a request to OpenAI API
 */
async function openaiRequest(endpoint, data, options = {}) {
  if (!validateOpenAIConfig()) {
    throw new Error("OpenAI is not properly configured");
  }

  const url = `${OPENAI_CONFIG.apiUrl}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_CONFIG.apiKey}`,
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
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("OpenAI API request failed:", error);
    throw error;
  }
}

/**
 * Chat completion
 */
export async function chatCompletion(messages, options = {}) {
  const {
    model = OPENAI_CONFIG.model,
    temperature = 0.7,
    max_tokens = 1000,
    stream = false,
  } = options;

  return await openaiRequest("/chat/completions", {
    model,
    messages,
    temperature,
    max_tokens,
    stream,
  });
}

/**
 * Simple text completion helper
 */
export async function complete(
  prompt,
  systemPrompt = "You are a helpful assistant.",
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
 * Analyze Figma design with AI
 */
export async function analyzeFigmaDesign(designData, question) {
  const systemPrompt = `You are an expert UI/UX designer analyzing Figma designs. 
Provide insightful feedback about layout, hierarchy, spacing, colors, and accessibility.`;

  const prompt = `Analyze this Figma design data and answer the question.

Design Data (simplified):
${JSON.stringify(designData, null, 2).substring(0, 2000)}...

Question: ${question}`;

  return await complete(prompt, systemPrompt);
}

/**
 * Generate slide content
 */
export async function generateSlideContent(topic, slideNumber, totalSlides) {
  const systemPrompt = `You are a professional presentation designer. 
Create concise, impactful slide content suitable for business presentations.`;

  const prompt = `Create content for slide ${slideNumber} of ${totalSlides} about: ${topic}

Provide:
1. A title (max 8 words)
2. 3-5 bullet points (each max 15 words)
3. A suggested visual description

Format as JSON.`;

  const response = await complete(prompt, systemPrompt);

  try {
    return JSON.parse(response);
  } catch {
    return { title: response.substring(0, 50), content: response };
  }
}

/**
 * OpenAI service object
 */
export const openai = {
  chatCompletion,
  complete,
  analyzeFigmaDesign,
  generateSlideContent,
  config: OPENAI_CONFIG,
};

export default openai;
