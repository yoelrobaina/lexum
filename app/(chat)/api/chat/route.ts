import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import {
  saveChat,
  saveMessages,
  getChatById,
  getMessagesByChatId,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import type { DBMessage } from "@/lib/db/schema"; 

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { id, message } = await request.json();
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    // ACTUALIZADO: Usamos el ID de Qwen 3 para máxima velocidad y gratuidad
    const modelId = "qwen/qwen3-4b:free";

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = []; 

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
          model: getLanguageModel(modelId),
          system: `Eres LexumIA, experto en guiones virales. 
          Genera guiones con GANCHO, CUERPO y CTA. 
          No des introducciones, ve directo al texto del guion.`,
          messages: modelMessages,
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
