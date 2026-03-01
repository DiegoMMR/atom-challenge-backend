import { runValidatorAgent } from "../agents/validatorAgent";

export const handleValidatorAgent = async (
  prompt: string,
  context?: string,
) => {
  try {
    const response = await runValidatorAgent(prompt, context);
    return response;
  } catch (error) {
    console.error("Error en el agente validador:", error);
    return "Lo siento, no pude validar la información que necesitas en este momento.";
  }
};
