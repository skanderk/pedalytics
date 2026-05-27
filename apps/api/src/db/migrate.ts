import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabaseConnection } from "./client.js";

function resolveMigrationPath() {
  const compiledPath = join(dirname(fileURLToPath(import.meta.url)), "migrations", "0001_initial.sql");
  if (existsSync(compiledPath)) {
    return compiledPath;
  }
  return join(process.cwd(), "src", "db", "migrations", "0001_initial.sql");
}

export function runMigrations(databasePath?: string) {
  const { sqlite } = createDatabaseConnection(databasePath);
  const migration = readFileSync(resolveMigrationPath(), "utf8");
  sqlite.exec(migration);
  sqlite.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log("Database migrations completed.");
}
