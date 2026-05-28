import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runMigrations } from "../src/db/migrate.js";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

function temporaryDatabasePath() {
  tempDir = mkdtempSync(join(tmpdir(), "pedalytics-"));
  return join(tempDir, "test.db");
}

describe("runMigrations", () => {
  it("can be run more than once", () => {
    const databasePath = temporaryDatabasePath();

    runMigrations(databasePath);
    runMigrations(databasePath);

    const sqlite = new Database(databasePath);
    const columns = sqlite.prepare("PRAGMA table_info(rides)").all().map((column) => (column as { name: string }).name);
    const applied = sqlite.prepare("SELECT name FROM schema_migrations ORDER BY name").all();

    expect(columns).toContain("max_speed_kmh");
    expect(columns).toContain("average_speed_kmh");
    expect(columns).not.toContain("max_distance_km");
    expect(columns).not.toContain("average_distance_km");
    const settingsColumns = sqlite
      .prepare("PRAGMA table_info(app_settings)")
      .all()
      .map((column) => (column as { name: string }).name);
    expect(settingsColumns).toContain("use_metric_system");
    expect(settingsColumns).not.toContain("default_city");
    expect(settingsColumns).not.toContain("distance_unit");
    expect(settingsColumns).not.toContain("created_at");
    expect(settingsColumns).not.toContain("updated_at");
    const rideIndexes = sqlite
      .prepare("PRAGMA index_list(rides)")
      .all()
      .map((index) => (index as { name: string }).name);
    expect(rideIndexes).toContain("idx_rides_ride_date");
    expect(applied).toHaveLength(7);
    sqlite.close();
  });

  it("renames existing ride distance metric columns to speed metric columns", () => {
    const databasePath = temporaryDatabasePath();
    const sqlite = new Database(databasePath);
    sqlite.exec(`
      CREATE TABLE locations (id INTEGER PRIMARY KEY AUTOINCREMENT);
      CREATE TABLE app_settings (id INTEGER PRIMARY KEY DEFAULT 1);
      CREATE TABLE rides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distance_km REAL NOT NULL,
        max_distance_km REAL,
        average_distance_km REAL
      );
    `);
    sqlite.close();

    runMigrations(databasePath);

    const migrated = new Database(databasePath);
    const columns = migrated.prepare("PRAGMA table_info(rides)").all().map((column) => (column as { name: string }).name);
    const applied = migrated.prepare("SELECT name FROM schema_migrations ORDER BY name").all();

    expect(columns).toContain("max_speed_kmh");
    expect(columns).toContain("average_speed_kmh");
    expect(columns).not.toContain("max_distance_km");
    expect(columns).not.toContain("average_distance_km");
    expect(applied).toEqual([
      { name: "0001_initial.sql" },
      { name: "0002_nullable_location_province_state.sql" },
      { name: "0003_add_ride_speed_metrics.sql" },
      { name: "0004_rename_ride_distance_metrics_to_speed_metrics.sql" },
      { name: "0005_simplify_app_settings.sql" },
      { name: "0006_remove_app_settings_timestamps.sql" },
      { name: "0007_index_rides_ride_date.sql" }
    ]);
    migrated.close();
  });
});
