import { createOpenAI } from '@ai-sdk/openai';

// Usamos el cliente de OpenAI pero apuntando a OpenRouter
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getLanguageModel(modelId: string) {
  return openrouter(modelId);
}

export function getTitleModel() {
  return openrouter("meta-llama/llama-3.1-8b-instruct:free");
}
