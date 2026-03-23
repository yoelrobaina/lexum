import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Configuramos OpenRouter directamente
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getLanguageModel(modelId: string) {
  // Aquí usamos el modelo de OpenRouter sin pasar por el 'gateway' de Vercel
  return openrouter(modelId);
}

export function getTitleModel() {
  // Usamos el mismo proveedor para el título
  return openrouter("meta-llama/llama-3.1-8b-instruct:free");
}
