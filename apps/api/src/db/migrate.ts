import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabaseConnection } from "./client.js";

type SqliteDatabase = ReturnType<typeof createDatabaseConnection>["sqlite"];

function resolveMigrationsDirectory() {
  const compiledPath = join(dirname(fileURLToPath(import.meta.url)), "migrations");
  if (existsSync(compiledPath)) {
    return compiledPath;
  }
  return join(process.cwd(), "src", "db", "migrations");
}

function tableExists(sqlite: SqliteDatabase, tableName: string): boolean {
  return Boolean(
    sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName)
  );
}

function columnExists(sqlite: SqliteDatabase, tableName: string, columnName: string): boolean {
  return sqlite
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((column) => (column as { name: string }).name === columnName);
}

function recordMigration(sqlite: SqliteDatabase, migrationName: string) {
  sqlite.prepare("INSERT OR IGNORE INTO schema_migrations (name) VALUES (?)").run(migrationName);
}

function initializeMigrationHistory(sqlite: SqliteDatabase, migrationNames: string[]) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = new Set(
    sqlite
      .prepare("SELECT name FROM schema_migrations")
      .all()
      .map((row) => (row as { name: string }).name)
  );

  if (applied.size > 0) {
    return applied;
  }

  const hasLocations = tableExists(sqlite, "locations");
  const hasRides = tableExists(sqlite, "rides");
  const hasAppSettings = tableExists(sqlite, "app_settings");
  const hasExistingSchema = hasLocations || hasRides || hasAppSettings;

  if (!hasExistingSchema) {
    return applied;
  }

  for (const migrationName of migrationNames) {
    if (migrationName === "0001_initial.sql" && hasLocations && hasRides && hasAppSettings) {
      recordMigration(sqlite, migrationName);
      applied.add(migrationName);
    }

    if (migrationName === "0002_nullable_location_province_state.sql" && hasLocations) {
      recordMigration(sqlite, migrationName);
      applied.add(migrationName);
    }

    if (
      migrationName === "0003_add_ride_speed_metrics.sql" &&
      hasRides &&
      ((columnExists(sqlite, "rides", "max_distance_km") &&
        columnExists(sqlite, "rides", "average_distance_km")) ||
        (columnExists(sqlite, "rides", "max_speed_kmh") &&
          columnExists(sqlite, "rides", "average_speed_kmh")))
    ) {
      recordMigration(sqlite, migrationName);
      applied.add(migrationName);
    }

    if (
      migrationName === "0004_rename_ride_distance_metrics_to_speed_metrics.sql" &&
      hasRides &&
      columnExists(sqlite, "rides", "max_speed_kmh") &&
      columnExists(sqlite, "rides", "average_speed_kmh")
    ) {
      recordMigration(sqlite, migrationName);
      applied.add(migrationName);
    }
  }

  return applied;
}

function runMigration(sqlite: SqliteDatabase, migrationName: string, sql: string) {
  if (migrationName === "0003_add_ride_speed_metrics.sql" && tableExists(sqlite, "rides")) {
    if (!columnExists(sqlite, "rides", "max_speed_kmh")) {
      sqlite.exec("ALTER TABLE rides ADD COLUMN max_speed_kmh REAL;");
    }
    if (!columnExists(sqlite, "rides", "average_speed_kmh")) {
      sqlite.exec("ALTER TABLE rides ADD COLUMN average_speed_kmh REAL;");
    }
    return;
  }

  if (migrationName === "0004_rename_ride_distance_metrics_to_speed_metrics.sql" && tableExists(sqlite, "rides")) {
    const hasOldMax = columnExists(sqlite, "rides", "max_distance_km");
    const hasOldAverage = columnExists(sqlite, "rides", "average_distance_km");
    const hasNewMax = columnExists(sqlite, "rides", "max_speed_kmh");
    const hasNewAverage = columnExists(sqlite, "rides", "average_speed_kmh");

    if (hasOldMax && !hasNewMax) {
      sqlite.exec("ALTER TABLE rides RENAME COLUMN max_distance_km TO max_speed_kmh;");
    } else if (!hasNewMax) {
      sqlite.exec("ALTER TABLE rides ADD COLUMN max_speed_kmh REAL;");
    }

    if (hasOldAverage && !hasNewAverage) {
      sqlite.exec("ALTER TABLE rides RENAME COLUMN average_distance_km TO average_speed_kmh;");
    } else if (!hasNewAverage) {
      sqlite.exec("ALTER TABLE rides ADD COLUMN average_speed_kmh REAL;");
    }
    return;
  }

  sqlite.exec(sql);
}

export function runMigrations(databasePath?: string) {
  const { sqlite } = createDatabaseConnection(databasePath);
  const migrationsDirectory = resolveMigrationsDirectory();
  const migrationPaths = readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => join(migrationsDirectory, fileName));
  const migrationNames = migrationPaths.map((migrationPath) => basename(migrationPath));
  const applied = initializeMigrationHistory(sqlite, migrationNames);

  for (const migrationPath of migrationPaths) {
    const migrationName = basename(migrationPath);
    if (applied.has(migrationName)) {
      continue;
    }

    runMigration(sqlite, migrationName, readFileSync(migrationPath, "utf8"));
    recordMigration(sqlite, migrationName);
  }
  sqlite.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log("Database migrations completed.");
}
