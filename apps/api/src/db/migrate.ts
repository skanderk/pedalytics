import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabaseConnection } from "./client.js";

function resolveMigrationsDirectory() {
  const compiledPath = join(dirname(fileURLToPath(import.meta.url)), "migrations");
  if (existsSync(compiledPath)) {
    return compiledPath;
  }
  return join(process.cwd(), "src", "db", "migrations");
}

export function runMigrations(databasePath?: string) {
  const { sqlite } = createDatabaseConnection(databasePath);
  const migrationsDirectory = resolveMigrationsDirectory();
  const migrationPaths = readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => join(migrationsDirectory, fileName));

  for (const migrationPath of migrationPaths) {
    sqlite.exec(readFileSync(migrationPath, "utf8"));
  }
  sqlite.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log("Database migrations completed.");
}
