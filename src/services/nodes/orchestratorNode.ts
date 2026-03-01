import { AgentDefinition } from "../../types/agent";
import { runOrchestrator } from "../agents/orchestratorAgent";
import { MemoryNode } from "./memoryNode";

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
    description:
      "Recopila la información requerida antes de procesar una solicitud",
    handles: ["falta información", "datos incompletos"],
  },
  {
    id: "catalog-specialist",
    description: "Gestiona consultas del catálogo de vehículos",
    handles: ["autos", "precios", "disponibilidad", "SUV", "sedán"],
  },
  {
    id: "generic",
    description: "Gestiona saludos o mensajes fuera de alcance",
    handles: ["hola", "gracias", "adiós"],
  },
];

const ensureValidDecision = (
  decision: OrchestratorNodeOutput,
  availableAgents: AgentDefinition[],
): OrchestratorNodeOutput => {
  const selectedExists = availableAgents.some(
    (agent) => agent.id === decision.selectedAgent,
  );

  if (selectedExists) {
    return decision;
  }

  const fallbackAgent =
    availableAgents.find((agent) => agent.id === "generic") ??
    availableAgents[0];

  if (!fallbackAgent) {
    throw new Error(
      "No hay agentes disponibles configurados para el orquestador",
    );
  }

  return {
    selectedAgent: fallbackAgent.id,
    reason: `El modelo seleccionó un agente desconocido (${decision.selectedAgent}). Se usará ${fallbackAgent.id} como respaldo.`,
    confidence: 0,
  };
};

export const orchestrator = async ({
  prompt,
  context,
}: OrchestratorNodeInput): Promise<OrchestratorNodeOutput> => {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("El prompt es obligatorio para la orquestación");
  }

  const memoryNode = new MemoryNode();
  const conversationId = "default-conversation";

  memoryNode.saveMessage(conversationId, {
    role: "user",
    content: prompt,
    timestamp: Date.now(),
  });

  const decision = await runOrchestrator({
    prompt: normalizedPrompt,
    context,
    availableAgents: agents,
  });

  memoryNode.saveMessage(conversationId, {
    role: "model",
    content: JSON.stringify(decision),
    timestamp: Date.now(),
  });

  return ensureValidDecision(decision, agents);
};
