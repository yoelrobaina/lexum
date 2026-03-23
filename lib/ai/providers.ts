import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export function getLanguageModel(modelId: string) {
  // Usamos el ID exacto de Qwen 3 (free) que seleccionaste
  return openrouter("qwen/qwen3-4b:free") as any;
}

export function getTitleModel() {
  return openrouter("qwen/qwen3-4b:free") as any;
}
