import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://smartcare:smartcare@localhost:5432/smartcare?schema=public"),
  JWT_ACCESS_SECRET: z.string().min(16).default("development-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("development-refresh-secret"),
  ENCRYPTION_KEY: z.string().min(16).default("development-encryption-key"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  FRONTEND_URL: z.string().url().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
