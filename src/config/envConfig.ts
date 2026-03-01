import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),

  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
};
