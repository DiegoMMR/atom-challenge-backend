import { googleAI } from "@genkit-ai/google-genai";
import { genkit, z } from "genkit";
import { Message } from "../../types/memory";

import { faqTool } from "../tools/faqTool";
import { vehiclesTool } from "../tools/vehiclesTool";
import { datesSlotsTool } from "../tools/datesSlotsTool";

const MODEL_NAME = "gemini-2.5-flash";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(MODEL_NAME, {
    temperature: 0.2,
  }),
});

const specialAgentInputSchema = z.object({
  prompt: z.string().describe("Pregunta del usuario"),
  messages: z
    .array(
      z.object({
        role: z
          .enum(["user", "model"])
          .describe('Rol del mensaje, puede ser "user" o "model"'),
        content: z.string().describe("Contenido del mensaje"),
        timestamp: z
          .number()
          .describe("Marca de tiempo del mensaje en formato UNIX"),
      }),
    )
    .optional()
    .describe(
      "Historial de mensajes anteriores en la conversación, si es relevante para proporcionar una respuesta más precisa",
    ),
  context: z
    .string()
    .optional()
    .describe(
      "Contexto breve de la conversación que puede ayudar a proporcionar una respuesta más precisa",
    ),
});

const systemPrompt = `Eres un agente especializado en manejar consultas específicas de la empresa, como horarios, precios, ubicaciones u otros datos predefinidos. Utiliza esta herramienta para proporcionar respuestas precisas y rápidas a los usuarios sobre información comúnmente solicitada. Analiza la consulta del usuario y responde con la información relevante basada en los datos predefinidos disponibles sobre la empresa. Si no tienes la información solicitada, responde de manera educada indicando que no puedes proporcionar esa información.`;

export const specialAgent = ai.defineFlow(
  {
    name: "specialAgent",
    inputSchema: specialAgentInputSchema,
    outputSchema: z.string().describe("Respuesta de la IA"),
  },
  async (input) => {
    let userPrompt = input.prompt;
    if (input.context) {
      userPrompt = `${input.context}\n\n${userPrompt}`;
    }

    const { text } = await ai.generate({
      prompt: userPrompt,
      system: systemPrompt,
      tools: [faqTool(ai), vehiclesTool(ai), datesSlotsTool(ai)],
      ...(input.messages
        ? {
            messages: input.messages.map((msg) => ({
              ...msg,
              content: [{ text: msg.content }],
            })),
          }
        : {}),
    });

    return text;
  },
);

export async function runSpecialAgent(
  prompt: string,
  context?: string,
  messages: Message[] = [],
) {
  const response = await specialAgent({
    prompt,
    context,
    messages,
  });

  return response;
}
