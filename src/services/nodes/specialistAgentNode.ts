import { runSpecialAgent } from "../agents/specialAgent";
import { MemoryNode } from "./memoryNode";

export const handleSpecialistAgent = async (
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

    const response = await runSpecialAgent(prompt, context);
    memoryNode.saveMessage(conversationId, {
      role: "model",
      content: response,
      timestamp: Date.now(),
    });
    return response;
  } catch (error) {
    console.error("Error en el agente especializado:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
