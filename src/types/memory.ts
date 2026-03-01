export type Memory = {
  id: string;
  conversationId: string;
  messages: Message[];
};

export type Message = {
  role: "user" | "model";
  content: string;
  timestamp: number;
};
