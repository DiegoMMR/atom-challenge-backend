import { runGenericAgent } from "../agents/genericAgent";

export const handleGenericAgent = async (prompt: string, context?: string) => {
  try {
    const response = await runGenericAgent(prompt, context);

    return response;
  } catch (error) {
    console.error("Error en el agente genérico:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
