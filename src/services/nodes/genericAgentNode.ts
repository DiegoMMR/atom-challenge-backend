import { runGenericAgent } from "../agents/genericAgent";
import { MemoryNode } from "./memoryNode";

const memoryNode = new MemoryNode();
const DEFAULT_CONVERSATION_ID = "default-conversation";

export const handleGenericAgent = async (
  prompt: string,
  context?: string,
  conversationId: string = DEFAULT_CONVERSATION_ID,
) => {
  try {
    const messages = await memoryNode.getConversationHistory(conversationId);
    const response = await runGenericAgent(prompt, context, messages);

    return response;
  } catch (error) {
    console.error("Error en el agente genérico:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
