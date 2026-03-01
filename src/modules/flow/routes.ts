import { FastifyPluginAsync } from 'fastify';

export const flowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const response = {
        message: 'Hello from the flow route!',
        timestamp: new Date().toISOString(),
      };

      return reply.send(response);
    } catch (error) {
      request.log.error(error, 'Error handling flow route');
      return reply.status(500).send({ error: 'Failed to handle flow route' });
    }
  });
};