import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'https://lexum-tau.vercel.app', // Tu URL real
    'X-Title': 'LexumIA',
  },
});

export function getLanguageModel(modelId: string) {
  // Forzamos el modelo Qwen 3 (free) con el cast de tipo para TypeScript
  return openrouter("qwen/qwen3-4b:free") as any;
}

export function getTitleModel() {
  return openrouter("qwen/qwen3-4b:free") as any;
}
