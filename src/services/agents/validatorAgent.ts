import { googleAI } from "@genkit-ai/google-genai";
import { genkit, z } from "genkit";
import { Message } from "../../types/memory";
import { env } from "../../config/envConfig";

const MODEL_NAME = env.GEMINI_MODEL;

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(MODEL_NAME, {
    temperature: 0.2,
  }),
});

const systemPrompt = `
Eres el Agente Validador de una concesionaria de autos.

Tu única responsabilidad es recopilar y validar los datos necesarios del usuario antes de que su solicitud sea procesada.

Reglas importantes:
- No resuelvas el caso de uso.
- No inventes información.
- No consultes herramientas.
- Solo recopila los datos requeridos según la intención detectada.
- Si falta información, pregunta únicamente lo que falta.

Casos de uso y datos requeridos:

1) Consultas Generales:
- Tipo de cliente (nuevo o existente)
- Tipo de ingreso (asalariado o independiente)
- Edad aproximada

2) Catálogo de Vehículos:
- Presupuesto aproximado
- Nuevo o usado
- Tipo de vehículo preferido (sedán, SUV, pickup, etc.)

3) Agendamiento de Cita:
- Nombre completo
- Fecha preferida
- Hora preferida
`;

export const validatorAgent = ai.defineFlow(
  {
    name: "validatorAgent",
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

    const { text } = await ai.generate({
      prompt: userPrompt,
      system: systemPrompt,
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

export async function runValidatorAgent(
  prompt: string,
  context?: string,
  messages: Message[] = [],
) {
  const response = await validatorAgent({
    prompt,
    context,
    messages,
  });
  return response;
}
