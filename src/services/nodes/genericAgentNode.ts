import { runGenericAgent } from "../agents/genericAgent";
import { MemoryNode } from "./memoryNode";

export const handleGenericAgent = async (prompt: string, context?: string) => {
  try {
    const memoryNode = new MemoryNode();
    const conversationId = "default-conversation";

    memoryNode.saveMessage(conversationId, {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    const response = await runGenericAgent(prompt, context);

    memoryNode.saveMessage(conversationId, {
      role: "model",
      content: response,
      timestamp: Date.now(),
    });

    return response;
  } catch (error) {
    console.error("Error en el agente genérico:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
