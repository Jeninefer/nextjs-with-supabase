// filepath: /home/codespace/OfficeAddinApps/Figma/lib/ai-api.ts
export async function generateText(prompt: string): Promise<string> {
  console.log('AI API:', prompt);
  return `Response for: ${prompt}`;
}
