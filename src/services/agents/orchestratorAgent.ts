import { googleAI } from '@genkit-ai/google-genai'
import { genkit, z } from 'genkit'

import { AgentDefinition } from '../../types/agent'

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.5-flash', {
    temperature: 0.2
  })
})

const AgentSchema = z.object({
  id: z.string(),
  description: z.string(),
  handles: z.array(z.string())
})

const OrchestratorInputSchema = z.object({
  prompt: z.string().describe('Mensaje actual del usuario'),
  context: z
    .string()
    .optional()
    .describe('Contexto breve de la conversación que puede ayudar al enrutamiento'),
  availableAgents: z
    .array(AgentSchema)
    .describe('Lista de agentes candidatos que se pueden seleccionar')
})

const OrchestratorOutputSchema = z.object({
  selectedAgent: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1)
})

type RunOrchestratorInput = {
  prompt: string
  context?: string
  availableAgents: AgentDefinition[]
}

function buildPrompt({
  prompt,
  context,
  availableAgents
}: RunOrchestratorInput): string {
  const agentsList = availableAgents
    .map((agent) => {
      const handles = agent.handles.join(', ')
      return `- ${agent.id}: ${agent.description} (maneja: ${handles})`
    })
    .join('\n')

  return `Eres un Orquestador de IA.

Tu tarea es seleccionar exactamente un agente para manejar la solicitud del usuario.

Reglas:
- Analiza el mensaje del usuario.
- Considera el contexto de la conversación.
- Elige SOLO un agente de la lista disponible.
- Devuelve una salida estructurada que cumpla con el esquema requerido.

Agentes disponibles:
${agentsList}

Contexto de la conversación:
${context || 'ninguno'}

Mensaje del usuario:
${prompt}`
}

const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: OrchestratorOutputSchema
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: buildPrompt(input),
      output: { schema: OrchestratorOutputSchema }
    })

    if (!output) {
      throw new Error('No se pudo generar la decisión del orquestador')
    }

    return output
  }
)

export async function runOrchestrator(input: RunOrchestratorInput) {
  return orchestratorFlow(input)
}