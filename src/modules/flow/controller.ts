import { FlowService } from "./service";
import { FlowConfig, NodeType } from "../../types/flow";

// nodes handlers
import { handleGenericAgent } from "../../services/nodes/genericAgentNode";
import { handleSpecialistAgent } from "../../services/nodes/specialistAgentNode";
import { handleValidatorAgent } from "../../services/nodes/validatorAgentNode";

export class FlowController {
  private service = new FlowService();

  getHandler = (type: NodeType): any => {
    if (type === "generic") return handleGenericAgent;
    if (type === "specialist") return handleSpecialistAgent;
    if (type === "validator") return handleValidatorAgent;
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

  async runFlow(id: string) {
    try {
      const flowId = id;
      const flow = await this.service.getFlow(flowId);

      return { message: "Flow execution started", flow };
    } catch (error) {
      throw new Error("Failed to run flow");
    }
  }
}
