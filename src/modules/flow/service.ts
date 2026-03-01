import { db } from "../../config/firebase";

export class FlowService {
  private collection = db.collection("flows");

  async createFlow(flow: any) {
    const docRef = this.collection.doc();

    await docRef.set({
      ...flow,
      createdAt: new Date(),
    });

    return { id: docRef.id };
  }

  async getFlow(flowId: string) {
    const doc = await this.collection.doc(flowId).get();

    if (!doc.exists) {
      throw new Error("Flow not found");
    }

    return { id: doc.id, ...doc.data() };
  }

  async updateFlow(flowId: string, data: any) {
    await this.collection.doc(flowId).update({
      ...data,
      updatedAt: new Date(),
    });
  }
}
