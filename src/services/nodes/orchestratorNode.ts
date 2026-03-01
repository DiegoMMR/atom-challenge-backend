import { AgentDefinition } from "../../types/agent";
import { runOrchestrator } from "../agents/orchestratorAgent";
import { MemoryNode } from "./memoryNode";

const memoryNode = new MemoryNode();
const DEFAULT_CONVERSATION_ID = "default-conversation";

export interface OrchestratorNodeInput {
  prompt: string;
  context?: string;
  nodes: { id: string }[];
  conversationId?: string;
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
    id: "specialist",
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

export const handleOrchestratorNode = async ({
  prompt,
  context,
  nodes,
  conversationId = DEFAULT_CONVERSATION_ID,
}: OrchestratorNodeInput): Promise<OrchestratorNodeOutput> => {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("El prompt es obligatorio para la orquestación");
  }

  const availableAgents = agents.filter((agent) =>
    nodes.some((node: { id: string }) => node.id.includes(agent.id)),
  );
  const messages = await memoryNode.getConversationHistory(conversationId);

  const decision = await runOrchestrator({
    prompt: normalizedPrompt,
    context,
    messages,
    availableAgents: availableAgents,
  });

  return ensureValidDecision(decision, availableAgents);
};
