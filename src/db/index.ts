import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// This is our entry point for accessing the database
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Type definitions
export type Database = ReturnType<typeof createDb>;
export * from './schema'; 