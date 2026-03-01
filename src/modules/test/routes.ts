import { FastifyPluginAsync } from "fastify";
import { handleSpecialistAgent } from "../../services/nodes/specialistAgentNode";
import { handleGenericAgent } from "../../services/nodes/genericAgentNode";

interface OrchestratorTestBody {
  prompt: string;
  context?: string;
}

export const testRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      const response = {
        message: "Hello from the test route!",
        timestamp: new Date().toISOString(),
      };

      return reply.send(response);
    } catch (error) {
      request.log.error(error, "Error handling test route");
      return reply.status(500).send({ error: "Failed to handle test route" });
    }
  });

  fastify.post<{ Body: OrchestratorTestBody }>(
    "/faq",
    async (request, reply) => {
      try {
        const { prompt, context } = request.body;
        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
          return reply
            .status(400)
            .send({ error: "El campo prompt es obligatorio" });
        }

        const response = await handleSpecialistAgent(prompt, context);
        return reply.send({
          input: { prompt, context },
          output: response,
        });
      } catch (error) {
        request.log.error(error, "Error handling FAQ test route");
        return reply
          .status(500)
          .send({ error: "No se pudo ejecutar el agente especializado" });
      }
    },
  );

  fastify.post<{ Body: OrchestratorTestBody }>(
    "/generic",
    async (request, reply) => {
      try {
        const { prompt, context } = request.body;
        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
          return reply
            .status(400)
            .send({ error: "El campo prompt es obligatorio" });
        }

        const response = await handleGenericAgent(prompt, context);
        return reply.send({
          input: { prompt, context },
          output: response,
        });
      } catch (error) {
        request.log.error(error, "Error handling generic agent test route");
        return reply
          .status(500)
          .send({ error: "No se pudo ejecutar el agente genérico" });
      }
    },
  );
};
