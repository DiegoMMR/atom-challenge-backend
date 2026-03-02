import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL!,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY!,

  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
};
