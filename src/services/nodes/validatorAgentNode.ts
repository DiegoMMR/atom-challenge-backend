import { runValidatorAgent } from "../agents/validatorAgent";
import { MemoryNode } from "./memoryNode";

export const handleValidatorAgent = async (
  prompt: string,
  context?: string,
) => {
  try {
    const memoryNode = new MemoryNode();
    const conversationId = "default-conversation";

    memoryNode.saveMessage(conversationId, {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    const response = await runValidatorAgent(prompt, context);
    memoryNode.saveMessage(conversationId, {
      role: "model",
      content: response,
      timestamp: Date.now(),
    });
    return response;
  } catch (error) {
    console.error("Error en el agente validador:", error);
    return "Lo siento, no pude validar la información que necesitas en este momento.";
  }
};
