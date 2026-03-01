import { MemoryRepository } from "../repositories/memoryRepository";
import { Message } from "../../types/memory";

export class MemoryNode {
    private memoryRepository: MemoryRepository;
    constructor() {
        this.memoryRepository = MemoryRepository.getInstance();
    }

    async saveMessage(conversationId: string, message: Message) {
        await this.memoryRepository.saveMessage(conversationId, message);
    }

    async getConversationHistory(conversationId: string) {
        return await this.memoryRepository.getConversationHistory(conversationId);
    }

    async deleteConversationHistory(conversationId: string) {
        await this.memoryRepository.deleteConversationHistory(conversationId);
    }
}