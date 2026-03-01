import { AgentDefinition } from "../../types/agent";
import { runOrchestrator } from "../agents/orchestratorAgent";

export interface OrchestratorNodeInput {
  prompt: string;
  context?: string;
}

export interface OrchestratorNodeOutput {
  selectedAgent: string;
  reason: string;
  confidence: number;
}

const agents: AgentDefinition[] = [
  {
    id: "validator",
    description: "Recopila la información requerida antes de procesar una solicitud",
    handles: ["falta información", "datos incompletos"]
  },
  {
    id: "catalog-specialist",
    description: "Gestiona consultas del catálogo de vehículos",
    handles: ["autos", "precios", "disponibilidad", "SUV", "sedán"]
  },
  {
    id: "generic",
    description: "Gestiona saludos o mensajes fuera de alcance",
    handles: ["hola", "gracias", "adiós"]
  }
]

const systemPrompt = `
Eres un Orquestador de IA.

Tu tarea es seleccionar qué agente debe manejar la solicitud del usuario.

Debes:
- Analizar el mensaje del usuario
- Considerar el contexto de la conversación
- Elegir SOLO UN agente de la lista
- Devolver solo JSON

Formato de salida:
{
  "selectedAgent": string,
  "reason": string,
  "confidence": number
}
`

const ensureValidDecision = (
  decision: OrchestratorNodeOutput,
  availableAgents: AgentDefinition[]
): OrchestratorNodeOutput => {
  const selectedExists = availableAgents.some(
    (agent) => agent.id === decision.selectedAgent
  );

  if (selectedExists) {
    return decision;
  }

  const fallbackAgent =
    availableAgents.find((agent) => agent.id === "generic") ??
    availableAgents[0];

  if (!fallbackAgent) {
    throw new Error("No hay agentes disponibles configurados para el orquestador");
  }

  return {
    selectedAgent: fallbackAgent.id,
    reason: `El modelo seleccionó un agente desconocido (${decision.selectedAgent}). Se usará ${fallbackAgent.id} como respaldo.`,
    confidence: 0
  };
};

export const orchestrator = async ({
  prompt,
  context
}: OrchestratorNodeInput): Promise<OrchestratorNodeOutput> => {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("El prompt es obligatorio para la orquestación");
  }

  const mergedContext = context
    ? `${systemPrompt.trim()}\n\nContexto de la conversación:\n${context}`
    : systemPrompt.trim();

  const decision = await runOrchestrator({
    prompt: normalizedPrompt,
    context: mergedContext,
    availableAgents: agents
  });

  return ensureValidDecision(decision, agents);
}