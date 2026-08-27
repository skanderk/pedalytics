import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabaseConnection } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { RidePersistenceMapper } from "../src/modules/rides/ride.persistence-mapper.js";
import { RideRepository } from "../src/modules/rides/ride.repository.js";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("RideRepository", () => {
  it("counts rides and returns stable pages in newest-first order", () => {
    tempDir = mkdtempSync(join(tmpdir(), "pedalytics-"));
    const databasePath = join(tempDir, "test.db");
    runMigrations(databasePath);
    const { db, sqlite } = createDatabaseConnection(databasePath);
    const repository = new RideRepository(db, new RidePersistenceMapper());

    for (let day = 1; day <= 12; day += 1) {
      repository.create({
        rideDate: `2026-01-${String(day).padStart(2, "0")}`,
        distanceKm: day
      });
    }

    expect(repository.count()).toBe(12);
    expect(repository.listPage(1, 10).map((ride) => ride.distanceKm)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
    expect(repository.listPage(2, 10).map((ride) => ride.distanceKm)).toEqual([2, 1]);
    sqlite.close();
  });
});
