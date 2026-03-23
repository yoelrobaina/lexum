import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { isProductionEnvironment } from "@/lib/constants";
import {
  saveChat,
  saveMessages,
  getChatById,
  getMessagesByChatId,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { id, message, messages: toolMessages, selectedChatModel } = await request.json();
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    // Configuración de LexumIA: Forzamos el modelo gratuito de OpenRouter
    const modelId = "meta-llama/llama-3-8b-instruct:free";

    const chat = await getChatById({ id });
    let messagesFromDb = [];

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      messagesFromDb = await getMessagesByChatId({ id });
    } else {
      await saveChat({
        id,
        userId: session.user.id,
        title: message?.content?.slice(0, 50) || "Nuevo Guion",
        visibility: "private",
      });
    }

    const uiMessages = [...convertToUIMessages(messagesFromDb), message];
    const modelMessages = await convertToModelMessages(uiMessages);

    // Guardar el mensaje del usuario antes de procesar
    if (message?.role === "user") {
      await saveMessages({
        messages: [{
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        }],
      });
    }

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          // IMPORTANTE: Asegúrate de tener OPENAI_API_BASE=https://openrouter.ai/api/v1 en Vercel
          model: getLanguageModel(modelId),
          system: `Eres LexumIA, el asistente de IA experto en guiones virales. 
          Tu objetivo es transformar cualquier idea en un guion estructurado para redes sociales.
          Instrucciones:
          1. El usuario te dará un NICHO, una RED SOCIAL y un TEMA.
          2. Genera un GANCHO potente (primeros 3 segundos).
          3. Desarrolla el CUERPO con puntos de valor o curiosidad.
          4. Termina con un CTA (Llamada a la acción) para seguir o comentar.
          Tono: Natural, persuasivo y dinámico. No uses introducciones como "Aquí tienes tu guion", ve directo al texto.`,
          messages: modelMessages,
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "X-Title": "LexumIA",
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "lexumia-stream",
          },
        });

        dataStream.merge(result.toUIMessageStream());
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              parts: msg.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });

  } catch (error) {
    console.error("Error en LexumIA:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}
