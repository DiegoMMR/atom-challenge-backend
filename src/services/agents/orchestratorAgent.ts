import openAI from "@genkit-ai/compat-oai";
import { genkit, z } from "genkit";

import { AgentDefinition } from "../../types/agent";
import { Message } from "../../types/memory";
import { env } from "../../config/envConfig";

const MODEL_NAME = env.OPENAI_MODEL;

const ai = genkit({
  plugins: [openAI({ name: "openai", apiKey: env.OPENAI_API_KEY })],
  model: `openai/${MODEL_NAME}`,
});

const AgentSchema = z.object({
  id: z.string(),
  description: z.string(),
  handles: z.array(z.string()),
});

const OrchestratorInputSchema = z.object({
  prompt: z.string().describe("Mensaje actual del usuario"),
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
      "Historial de mensajes anteriores en la conversación, si es relevante para proporcionar una mejor decisión de enrutamiento",
    ),
  context: z
    .string()
    .optional()
    .describe(
      "Contexto breve de la conversación que puede ayudar al enrutamiento",
    ),
  availableAgents: z
    .array(AgentSchema)
    .describe("Lista de agentes candidatos que se pueden seleccionar"),
});

const OrchestratorOutputSchema = z.object({
  selectedAgent: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
});

type RunOrchestratorInput = {
  prompt: string;
  messages?: Message[];
  context?: string;
  availableAgents: AgentDefinition[];
};

function generateSystemPrompt(availableAgents: AgentDefinition[]): string {
  const agentsList = availableAgents
    .map((agent) => {
      const handles = agent.handles.join(", ");
      return `- ${agent.id}: ${agent.description} (maneja: ${handles})`;
    })
    .join("\n");

  return `Eres un Orquestador de IA.

  para una empresa de venta de vehículos. Tu tarea es analizar el mensaje del usuario y decidir qué agente es el más adecuado para manejar la solicitud, basándote en el contenido del mensaje y el contexto de la conversación.

Tu tarea es seleccionar exactamente un agente para manejar la solicitud del usuario.

Reglas:
- Analiza el mensaje del usuario.
- Considera el contexto de la conversación.
- Elige SOLO un agente de la lista disponible.
- Usa 'validator' únicamente cuando falten datos requeridos para continuar.
- Devuelve una salida estructurada que cumpla con el esquema requerido.

Agentes disponibles:
${agentsList}`;
}

const orchestratorFlow = ai.defineFlow(
  {
    name: "orchestratorFlow",
    inputSchema: OrchestratorInputSchema,
    outputSchema: OrchestratorOutputSchema,
  },
  async (input) => {
    let userPrompt = `Mensaje del usuario:\n${input.prompt}`;
    if (input.context) {
      userPrompt = `Contexto de la conversación:\n${input.context}\n\n${userPrompt}`;
    }

    const { output } = await ai.generate({
      system: generateSystemPrompt(input.availableAgents),
      prompt: userPrompt,
      config: {
        temperature: 0.2,
      },
      output: { schema: OrchestratorOutputSchema },
      ...(input.messages
        ? {
            messages: input.messages.map((msg) => ({
              ...msg,
              content: [{ text: msg.content }],
            })),
          }
        : {}),
    });

    if (!output) {
      throw new Error("No se pudo generar la decisión del orquestador");
    }

    return output;
  },
);

export async function runOrchestrator(input: RunOrchestratorInput) {
  return orchestratorFlow(input);
}
