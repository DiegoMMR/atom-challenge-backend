import { env } from '../../config/envConfig';

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Telegram API error ${response.status}: ${errorBody}`);
  }
}
