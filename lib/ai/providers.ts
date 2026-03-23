import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Configuración pura de OpenRouter, sin rastro de OpenAI
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getLanguageModel(modelId: string) {
  return openrouter(modelId);
}

export function getTitleModel() {
  return openrouter("meta-llama/llama-3.1-8b-instruct:free");
}
