import { FlowService } from "./service";

export class FlowController {
  private service = new FlowService();

  async createFlow(data: any) {
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

  async updateFlow(id: string, updateData: any) {
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
