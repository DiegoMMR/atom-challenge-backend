import { runSpecialAgent } from "../agents/specialAgent";

export const handleSpecialistAgent = async (
  prompt: string,
  context?: string,
) => {
  try {
    const response = await runSpecialAgent(prompt, context);
    return response;
  } catch (error) {
    console.error("Error en el agente especializado:", error);
    return "Lo siento, no pude obtener la información que necesitas en este momento.";
  }
};
