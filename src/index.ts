import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { env } from './config/envConfig';

import { flowRoutes } from './modules/flow/routes';
import { testRoutes } from './modules/test/routes';

const fastify = Fastify({ logger: true });

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: [env.ALLOW_ORIGIN],
      methods: ['GET', 'POST', 'OPTIONS'],
    });

    await fastify.register(helmet);

    await fastify.register(flowRoutes, { prefix: '/flow' });
    await fastify.register(testRoutes, { prefix: '/test' });

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Handle graceful shutdown
const shutdown = async (signal: string) => {
  fastify.log.info(`${signal} received. Shutting down gracefully...`);
  try {
    await fastify.close();
    fastify.log.info('Server closed');
    process.exit(0);
  } catch (err) {
    fastify.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
