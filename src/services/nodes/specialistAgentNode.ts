import { runSpecialAgent } from "../agents/specialAgent";
import { MemoryNode } from "./memoryNode";

const memoryNode = new MemoryNode();
const DEFAULT_CONVERSATION_ID = "default-conversation";

export const handleSpecialistAgent = async (
  prompt: string,
  context?: string,
  conversationId: string = DEFAULT_CONVERSATION_ID,
) => {
  try {
    const messages = await memoryNode.getConversationHistory(conversationId);
    const response = await runSpecialAgent(prompt, context, messages);
    return response;
  } catch (error) {
    console.error("Error en el agente especializado:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
