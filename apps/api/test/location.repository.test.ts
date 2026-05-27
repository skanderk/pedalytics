import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabaseConnection } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { LocationRepository } from "../src/modules/locations/location.repository.js";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("LocationRepository", () => {
  it("creates and reads locations", () => {
    tempDir = mkdtempSync(join(tmpdir(), "pedalytics-"));
    const databasePath = join(tempDir, "test.db");
    runMigrations(databasePath);
    const { db, sqlite } = createDatabaseConnection(databasePath);
    const repository = new LocationRepository(db);

    const created = repository.create({
      name: "Cafe",
      city: "Montreal",
      provinceState: "QC",
      country: "Canada"
    });

    expect(repository.findById(created.id)?.name).toBe("Cafe");
    sqlite.close();
  });
});
