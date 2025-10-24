const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function generateText(prompt: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
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
  return await response.json();
}