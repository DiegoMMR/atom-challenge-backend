import { Message } from "../../types/memory";

export interface IMemoryRepository {
  saveMessage(conversationId: string, message: Message): Promise<void>;
  getConversationHistory(conversationId: string): Promise<Message[]>;
  deleteConversationHistory(conversationId: string): Promise<void>;
}

export class MemoryRepository implements IMemoryRepository {
  private static instance: MemoryRepository;
  private memory: Map<string, Message[]>;

  private constructor() {
    this.memory = new Map<string, Message[]>();
  }

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
    const history = this.memory.get(conversationId) || [];
    history.push(message);
    this.memory.set(conversationId, history);
  }

  public async getConversationHistory(
    conversationId: string,
  ): Promise<Message[]> {
    return this.memory.get(conversationId) || [];
  }

  public async deleteConversationHistory(
    conversationId: string,
  ): Promise<void> {
    this.memory.delete(conversationId);
  }
}
