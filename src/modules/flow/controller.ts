import { FlowService } from "./service";
import {
  FlowConfig,
  FlowExecutionStep,
  FlowRunResponse,
  INodeConfig,
  NodeType,
} from "../../types/flow";
import { OrchestratorNodeOutput } from "../../services/nodes/orchestratorNode";

// nodes handlers
import { handleGenericAgent } from "../../services/nodes/genericAgentNode";
import { handleSpecialistAgent } from "../../services/nodes/specialistAgentNode";
import { handleValidatorAgent } from "../../services/nodes/validatorAgentNode";
import { handleOrchestratorNode } from "../../services/nodes/orchestratorNode";

export class FlowController {
  private service = new FlowService();

  getHandler = (type: NodeType): any => {
    if (type === "generic") return handleGenericAgent;
    if (type === "specialist") return handleSpecialistAgent;
    if (type === "validator") return handleValidatorAgent;
    if (type === "orchestrator") return handleOrchestratorNode;
  };

  async createFlow(data: FlowConfig) {
    try {
      const flowData = data;
      const result = await this.service.createFlow(flowData);
      return result;
    } catch (error) {
      throw new Error("Failed to create flow");
    }
  }

  async getFlow(id: string) {
    try {
      const flowId = id;
      const result = await this.service.getFlow(flowId);
      return result;
    } catch (error) {
      throw new Error("Failed to get flow");
    }
  }

  async updateFlow(id: string, updateData: FlowConfig) {
    try {
      const flowId = id;
      await this.service.updateFlow(flowId, updateData);
      return { message: "Flow updated successfully" };
    } catch (error) {
      throw new Error("Failed to update flow");
    }
  }

  async runFlow(id: string, input: string) {
    try {
      const flowId = id;
      const flow = await this.service.getFlow(flowId);

      if (!flow?.length) {
        throw new Error("Flow sin nodos");
      }

      const initNodes = flow.filter((node) => node.typeNode === "init");
      if (initNodes.length !== 1) {
        throw new Error("El flow debe tener exactamente un nodo init");
      }

      const nodeMap = new Map<string, INodeConfig>(
        flow.map((node) => [node.id, node]),
      );

      const trace: FlowExecutionStep[] = [];
      const executedNodes: string[] = [];
      const visitedNodes = new Set<string>();

      let currentNode: INodeConfig = initNodes[0];
      let currentInput = input;
      let finalOutput = input;

      const maxSteps = Math.max(flow.length * 3, 10);
      let stepCount = 0;

      while (stepCount < maxSteps) {
        stepCount += 1;

        if (visitedNodes.has(currentNode.id)) {
          throw new Error(`Ciclo detectado en nodo ${currentNode.id}`);
        }

        visitedNodes.add(currentNode.id);
        executedNodes.push(currentNode.id);

        if (currentNode.typeNode === "end") {
          trace.push({
            nodeId: currentNode.id,
            nodeType: currentNode.typeNode,
            input: currentInput,
            output: finalOutput,
          });

          const result: FlowRunResponse = {
            success: true,
            flowId,
            stoppedAt: currentNode.id,
            executedNodes,
            finalOutput,
            trace,
          };

          return result;
        }

        const nextCandidates = (currentNode.ports.out || [])
          .map((port) => nodeMap.get(port.id))
          .filter((node): node is INodeConfig => Boolean(node));

        if (
          (currentNode.ports.out || []).length > 0 &&
          nextCandidates.length === 0
        ) {
          throw new Error(
            `El nodo ${currentNode.id} tiene salidas inválidas (destinos no encontrados)`,
          );
        }

        if (currentNode.typeNode === "init") {
          const nextNode = nextCandidates[0];

          if (!nextNode) {
            throw new Error("El nodo init no tiene una salida válida");
          }

          trace.push({
            nodeId: currentNode.id,
            nodeType: currentNode.typeNode,
            input: currentInput,
            output: currentInput,
            nextNodeId: nextNode.id,
          });

          currentNode = nextNode;
          continue;
        }

        const handler = this.getHandler(currentNode.typeNode);
        if (!handler) {
          throw new Error(
            `No existe handler para el nodo ${currentNode.typeNode}`,
          );
        }

        if (currentNode.typeNode === "orchestrator") {
          const decision = (await handler({
            prompt: currentInput,
            nodes: nextCandidates.map((node) => ({ id: node.id })),
          })) as OrchestratorNodeOutput;

          const selectedType = decision.selectedAgent as NodeType;
          const selectedNode = nextCandidates.find(
            (node) => node.typeNode === selectedType,
          );

          if (!selectedNode) {
            throw new Error(
              `El orchestrator seleccionó '${decision.selectedAgent}' pero no hay nodo destino compatible`,
            );
          }

          const serializedDecision = JSON.stringify(decision);

          trace.push({
            nodeId: currentNode.id,
            nodeType: currentNode.typeNode,
            input: currentInput,
            output: serializedDecision,
            selectedAgent: decision.selectedAgent,
            nextNodeId: selectedNode.id,
          });

          currentNode = selectedNode;
          continue;
        }

        const output = (await handler(currentInput)) as string;
        finalOutput = output;

        const nextNode = nextCandidates[0];
        trace.push({
          nodeId: currentNode.id,
          nodeType: currentNode.typeNode,
          input: currentInput,
          output,
          nextNodeId: nextNode?.id,
        });

        if (!nextNode) {
          throw new Error(
            `El nodo ${currentNode.id} no tiene salida hacia el nodo end`,
          );
        }

        currentInput = output;
        currentNode = nextNode;
      }

      throw new Error("Se alcanzó el límite máximo de pasos del flujo");
    } catch (error) {
      throw new Error(`Failed to run flow: ${(error as Error).message}`);
    }
  }
}
