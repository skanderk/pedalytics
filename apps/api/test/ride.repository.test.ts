import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabaseConnection } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { LocationPersistenceMapper } from "../src/modules/locations/location.persistence-mapper.js";
import { LocationRepository } from "../src/modules/locations/location.repository.js";
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

  it("aggregates all-time destination visits and excludes locations without coordinates", () => {
    tempDir = mkdtempSync(join(tmpdir(), "pedalytics-"));
    const databasePath = join(tempDir, "test.db");
    runMigrations(databasePath);
    const { db, sqlite } = createDatabaseConnection(databasePath);
    const locations = new LocationRepository(db, new LocationPersistenceMapper());
    const repository = new RideRepository(db, new RidePersistenceMapper());
    const park = locations.create({ name: "River Park", city: "Montreal", country: "Canada", latitude: 45.5, longitude: -73.6 });
    const lookout = locations.create({ name: "Lookout", city: "Montreal", country: "Canada", latitude: 45.51, longitude: -73.59 });
    const unmapped = locations.create({ name: "Unknown", city: "Montreal", country: "Canada" });

    repository.create({ rideDate: "2024-01-01", distanceKm: 10, destinationLocationId: park.id });
    repository.create({ rideDate: "2025-06-01", distanceKm: 15, destinationLocationId: park.id });
    repository.create({ rideDate: "2026-08-01", distanceKm: 20, destinationLocationId: lookout.id });
    repository.create({ rideDate: "2026-08-02", distanceKm: 5, destinationLocationId: unmapped.id });
    repository.create({ rideDate: "2026-08-03", distanceKm: 8 });

    expect(repository.listDestinationVisits()).toEqual([
      { locationId: park.id, name: "River Park", latitude: 45.5, longitude: -73.6, visitCount: 2 },
      { locationId: lookout.id, name: "Lookout", latitude: 45.51, longitude: -73.59, visitCount: 1 }
    ]);
    sqlite.close();
  });
});
