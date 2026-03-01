import { googleAI } from "@genkit-ai/google-genai";
import { genkit, z } from "genkit";

const MODEL_NAME = "gemini-2.5-flash";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(MODEL_NAME, {
    temperature: 0.2,
  }),
});

const systemPrompt = `Eres un agente especializado en manejar recopilar datos necesarios del usuario para poder procesar su solicitud`;

export const validatorAgent = ai.defineFlow(
  {
    name: "validatorAgent",
    inputSchema: z.object({
      prompt: z.string().describe("Pregunta del usuario"),
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
    });
    return text;
  },
);

export async function runValidatorAgent(prompt: string, context?: string) {
  const response = await validatorAgent({
    prompt,
    context,
  });
  return response;
}
