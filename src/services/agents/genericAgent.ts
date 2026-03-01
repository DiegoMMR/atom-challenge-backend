import { googleAI } from '@genkit-ai/google-genai'
import { genkit, z } from 'genkit'

const MODEL_NAME = 'gemini-2.5-flash'

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(MODEL_NAME, {
    temperature: 0.2
  })
})

const systemPrompt = `Eres un asistente virtual que responde a las preguntas de los usuarios de manera clara y precisa. Analiza la consulta del usuario y proporciona una respuesta útil basada en tu conocimiento general. Si no tienes la información solicitada, responde de manera educada indicando que no puedes proporcionar esa información.`

export const genericAgent = ai.defineFlow(
    {
        name: 'genericAgent',
        inputSchema: z.object({
            prompt: z.string().describe('Pregunta del usuario'),
            context: z.string().optional().describe('Contexto breve de la conversación que puede ayudar a proporcionar una respuesta más precisa')
        }),
        outputSchema: z.string().describe('Respuesta de la IA'),
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
    }
);

export async function runGenericAgent(prompt: string, context?: string) {
    const response = await genericAgent({
        prompt,
        context,
    });
    return response;
}