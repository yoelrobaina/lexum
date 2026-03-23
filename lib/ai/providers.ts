import { createOpenAI } from '@ai-sdk/openai';

// Esto es OpenRouter disfrazado para que Vercel no se queje
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1', 
});

export function getLanguageModel(modelId: string) {
  return openrouter(modelId);
}

export function getTitleModel() {
  return openrouter("meta-llama/llama-3.1-8b-instruct:free");
}
