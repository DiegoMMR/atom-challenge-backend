import { FlowRunRequest, FlowUpdateRequest } from '../../types/flow';
import { TelegramWebhookBody } from '../../types/telegram';
import { FastifyPluginAsync } from 'fastify';
import { FlowController } from './controller';
import { MemoryNode } from '../../services/nodes/memoryNode';
import { sendTelegramMessage } from '../../services/telegram/telegramService';

const flowController = new FlowController();
const memoryNode = new MemoryNode();

export const flowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const flowId = 'quiZ6ky9euPmSFAPN36O';
      const response = await flowController.getFlow(flowId);

      return reply.send(response);
    } catch (error) {
      request.log.error(error, 'Error handling flow route');
      return reply.status(500).send({ error: 'Failed to handle flow route' });
    }
  });

  fastify.post('/update', async (request, reply) => {
    try {
      const body = request.body as FlowUpdateRequest;

      const flowId = body.id;
      const updateData = body.flow;

      const response = await flowController.updateFlow(flowId, updateData);
      return reply.send(response);
    } catch (error) {
      request.log.error(error, 'Error handling flow update route');
      return reply
        .status(500)
        .send({ error: 'Failed to handle flow update route' });
    }
  });

  fastify.post('/run', async (request, reply) => {
    try {
      const body = request.body as FlowRunRequest;
      const flowId = body.id;
      const input = body.input;
      const conversationId = 'default-conversation';

      memoryNode.saveMessage(conversationId, {
        role: 'user',
        content: input,
        timestamp: Date.now(),
      });

      const response = await flowController.runFlow(flowId, input);

      memoryNode.saveMessage(conversationId, {
        role: 'model',
        content: response.finalOutput,
        timestamp: Date.now(),
      });

      return reply.send(response);
    } catch (error) {
      request.log.error(error, 'Error handling flow run route');
      return reply
        .status(500)
        .send({ error: 'Failed to handle flow run route' });
    }
  });
  fastify.post('/social', async (request, reply) => {
    try {
      const body = request.body as TelegramWebhookBody;
      const chatId = body.message.chat.id;
      const input = body.message.text;
      const flowId = 'quiZ6ky9euPmSFAPN36O';
      const conversationId = `telegram-${chatId}`;

      memoryNode.saveMessage(conversationId, {
        role: 'user',
        content: input,
        timestamp: Date.now(),
      });

      const response = await flowController.runFlow(flowId, input);

      memoryNode.saveMessage(conversationId, {
        role: 'model',
        content: response.finalOutput,
        timestamp: Date.now(),
      });

      await sendTelegramMessage(chatId, response.finalOutput);

      return reply.send({ ok: true });
    } catch (error) {
      request.log.error(error, 'Error handling flow social route');
      return reply
        .status(500)
        .send({ error: 'Failed to handle flow social route' });
    }
  });
};
