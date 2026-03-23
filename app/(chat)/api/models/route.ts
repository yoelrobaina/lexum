import { getAllGatewayModels, getCapabilities, isDemo } from "@/lib/ai/models";

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
    "Content-Type": "application/json",
  };

  // 1. Cambiamos la lógica para que apunte a OpenRouter
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    const openRouterData = await response.json();
    
    // 2. Filtramos para que solo aparezca el modelo gratuito que queremos (Llama 3)
    // O puedes dejar que salgan todos si quieres que el usuario elija.
    const models = openRouterData.data.map((m: any) => ({
      id: m.id,
      name: m.name,
      capabilities: m.architecture || {},
    }));

    return Response.json({ models }, { headers });

  } catch (error) {
    // Si falla, devolvemos un fallback básico para que la web no se rompa
    return Response.json({ 
      models: [{ id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B (Free)" }] 
    }, { headers });
  }
}
