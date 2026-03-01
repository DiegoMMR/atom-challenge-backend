import { db } from "../../config/firebase";
import { Message } from "../../types/memory";

export interface IMemoryRepository {
  saveMessage(conversationId: string, message: Message): Promise<void>;
  getConversationHistory(conversationId: string): Promise<Message[]>;
  deleteConversationHistory(conversationId: string): Promise<void>;
}

export class MemoryRepository implements IMemoryRepository {
  private static instance: MemoryRepository;
  private collection = db.collection("memory");

  private constructor() {}

  public static getInstance(): MemoryRepository {
    if (!MemoryRepository.instance) {
      MemoryRepository.instance = new MemoryRepository();
    }
    return MemoryRepository.instance;
  }

  public async saveMessage(
    conversationId: string,
    message: Message,
  ): Promise<void> {
    const conversationRef = this.collection.doc(conversationId);

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(conversationRef);
      const existingMessages =
        (snapshot.data()?.messages as Message[] | undefined) || [];

      transaction.set(
        conversationRef,
        {
          conversationId,
          messages: [...existingMessages, message],
          updatedAt: new Date(),
        },
        { merge: true },
      );
    });
  }

  public async getConversationHistory(
    conversationId: string,
  ): Promise<Message[]> {
    const snapshot = await this.collection.doc(conversationId).get();

    if (!snapshot.exists) {
      return [];
    }

    const messages = (snapshot.data()?.messages as Message[] | undefined) || [];

    return [...messages].sort(
      (first, second) => first.timestamp - second.timestamp,
    );
  }

  public async deleteConversationHistory(
    conversationId: string,
  ): Promise<void> {
    await this.collection.doc(conversationId).delete();
  }
}
