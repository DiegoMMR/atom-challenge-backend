import { FastifyPluginAsync } from "fastify";
import { FlowController } from "./controller";
const flowController = new FlowController();

export const flowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    try {
      const flowId = "quiZ6ky9euPmSFAPN36O";
      const response = await flowController.getFlow(flowId);

      return reply.send(response);
    } catch (error) {
      request.log.error(error, "Error handling flow route");
      return reply.status(500).send({ error: "Failed to handle flow route" });
    }
  });
};
