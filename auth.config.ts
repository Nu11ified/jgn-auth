import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Create a SQLite database for CLI operations
const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

// Export the auth instance directly as required by Better Auth CLI
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
}); 