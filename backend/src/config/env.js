import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const ENV = {
  PORT: process.env.PORT || 8001,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
};
