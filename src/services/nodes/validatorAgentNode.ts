import { runValidatorAgent } from "../agents/validatorAgent";
import { MemoryNode } from "./memoryNode";

const memoryNode = new MemoryNode();
const DEFAULT_CONVERSATION_ID = "default-conversation";

export const handleValidatorAgent = async (
  prompt: string,
  context?: string,
  conversationId: string = DEFAULT_CONVERSATION_ID,
) => {
  try {
    const messages = await memoryNode.getConversationHistory(conversationId);
    const response = await runValidatorAgent(prompt, context, messages);
    return response;
  } catch (error) {
    console.error("Error en el agente validador:", error);
    return "Lo siento, no pude validar la información que necesitas en este momento.";
  }
};
