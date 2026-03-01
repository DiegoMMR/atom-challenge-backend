import { db } from "../../config/firebase";
import { FlowConfig } from "../../types/flow";

export class FlowService {
  private collection = db.collection("flows");

  async createFlow(flow: FlowConfig) {
    const docRef = this.collection.doc();

    await docRef.set({
      flow: JSON.stringify(flow),
      createdAt: new Date(),
    });

    return { id: docRef.id };
  }

  async getFlow(flowId: string): Promise<FlowConfig> {
    const doc = await this.collection.doc(flowId).get();

    if (!doc.exists) {
      throw new Error("Flow not found");
    }

    return JSON.parse(doc.data()?.flow as string) as FlowConfig;
  }

  async updateFlow(flowId: string, data: FlowConfig) {
    await this.collection.doc(flowId).update({
      flow: JSON.stringify(data),
      updatedAt: new Date(),
    });
  }
}
