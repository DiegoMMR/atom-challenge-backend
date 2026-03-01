import { FastifyPluginAsync } from 'fastify';
import { orchestrator } from '../../services/nodes/orchestratorNode';
import { handleSpecialAgent } from '../../services/nodes/specialAgentNode';

interface OrchestratorTestBody {
  prompt: string;
  context?: string;
}

export const testRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const response = {
        message: 'Hello from the test route!',
        timestamp: new Date().toISOString(),
      };

      return reply.send(response);
    } catch (error) {
      request.log.error(error, 'Error handling test route');
      return reply.status(500).send({ error: 'Failed to handle test route' });
    }
  });

  fastify.post<{ Body: OrchestratorTestBody }>('/orchestrator', async (request, reply) => {
    try {
      const { prompt, context } = request.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return reply.status(400).send({ error: 'El campo prompt es obligatorio' });
      }

      const decision = await orchestrator({
        prompt,
        context,
      });

      return reply.send({
        input: { prompt, context },
        output: decision,
      });
    } catch (error) {
      request.log.error(error, 'Error handling orchestrator test route');
      return reply.status(500).send({ error: 'No se pudo ejecutar el orquestador' });
    }
  });

  fastify.post<{ Body: OrchestratorTestBody }>('/faq', async (request, reply) => {
    try {
      const { prompt, context } = request.body;
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return reply.status(400).send({ error: 'El campo prompt es obligatorio' });
      }

      const response = await handleSpecialAgent(prompt, context);
      return reply.send({
        input: { prompt, context },
        output: response,
      });
    } catch (error) {
      request.log.error(error, 'Error handling FAQ test route');
      return reply.status(500).send({ error: 'No se pudo ejecutar el agente especializado' });
    }
  });
};