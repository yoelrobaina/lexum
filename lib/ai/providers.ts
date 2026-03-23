import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export function getLanguageModel(modelId: string) {
  // Forzamos el ID exacto que OpenRouter prefiere
  return openrouter("google/gemini-2.0-flash-lite-preview-02-05:free");
}

export function getTitleModel() {
  return openrouter("google/gemini-2.0-flash-lite-preview-02-05:free");
}
