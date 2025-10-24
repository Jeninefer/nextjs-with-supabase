const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HUGGINGFACE_API_KEY) {
  throw new Error("HUGGINGFACE_API_KEY environment variable is not set. Please set it before importing this module.");
}

export async function generateText(prompt: string) {
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  return await response.json();
}

// Available free models:
// - Mistral-7B-Instruct (OpenAI GPT-3.5 equivalent)
// - Llama-2-70B (GPT-4 comparable)
// - Falcon-180B (GPT-4 comparable)

export async function ollamaGenerate(
  prompt: string, 
  model: string = 'mistral'
) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return await response.json();