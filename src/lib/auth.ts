import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";

/**
 * Factory function that returns a configured Better Auth instance
 * using Drizzle ORM with Cloudflare D1
 */
export const getAuth = (d1: D1Database) => {
  const db = createDb(d1);
  
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    // Uncomment and configure as needed:
    // socialProviders: { 
    //   github: { 
    //     clientId: process.env.GITHUB_CLIENT_ID,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //   }
    // },
  });
}; 