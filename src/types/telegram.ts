export interface TelegramWebhookBody {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text: string;
  };
}
