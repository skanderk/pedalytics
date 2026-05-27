import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema.js";

const defaultDatabasePath = resolve(process.cwd(), "data", "pedalytics.db");

export function createDatabaseConnection(databasePath = process.env.DATABASE_URL ?? defaultDatabasePath) {
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}

export type PedalyticsDatabase = ReturnType<typeof createDatabaseConnection>["db"];
