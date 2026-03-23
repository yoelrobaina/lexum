import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getLanguageModel(modelId: string) {
  // El "as any" le dice a TypeScript: "Tranquilo, yo sé lo que hago"
  return openrouter(modelId) as any;
}

export function getTitleModel() {
  return openrouter("meta-llama/llama-3.1-8b-instruct:free") as any;
}
