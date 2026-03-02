import openAI from "@genkit-ai/compat-oai";
import { GenerateOptions, genkit, z } from "genkit";
import { Message } from "../../types/memory";
import { env } from "../../config/envConfig";

const MODEL_NAME = env.OPENAI_MODEL;

const ai = genkit({
  plugins: [openAI({ name: "openai", apiKey: env.OPENAI_API_KEY })],
  model: `openai/${MODEL_NAME}`,
});

const systemPrompt = `Eres un asistente virtual que responde a las preguntas de los usuarios de manera clara y precisa. Analiza la consulta del usuario y proporciona una respuesta útil basada en tu conocimiento general. Si no tienes la información solicitada, responde de manera educada indicando que no puedes proporcionar esa información.`;

export const genericAgent = ai.defineFlow(
  {
    name: "genericAgent",
    inputSchema: z.object({
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
    }),
    outputSchema: z.string().describe("Respuesta de la IA"),
  },
  async (input) => {
    let userPrompt = input.prompt;
    if (input.context) {
      userPrompt = `${input.context}\n\n${userPrompt}`;
    }
    const params: GenerateOptions = {
      prompt: userPrompt,
      system: systemPrompt,
      config: {
        temperature: 0.2,
      },
    };

    if (input.messages) {
      params.messages = input.messages.map((msg) => ({
        ...msg,
        content: [{ text: msg.content }],
      }));
    }

    const { text } = await ai.generate(params);
    return text;
  },
);

export async function runGenericAgent(
  prompt: string,
  context?: string,
  messages: Message[] = [],
) {
  const response = await genericAgent({
    prompt,
    context,
    messages: messages,
  });
  return response;
}
