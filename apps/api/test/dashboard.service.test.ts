import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabaseConnection } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { rides } from "../src/db/schema.js";
import { DashboardRepository } from "../src/modules/dashboard/dashboard.repository.js";
import { DashboardService } from "../src/modules/dashboard/dashboard.service.js";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

function createDashboard() {
  tempDir = mkdtempSync(join(tmpdir(), "pedalytics-"));
  const databasePath = join(tempDir, "test.db");
  runMigrations(databasePath);
  const { db, sqlite } = createDatabaseConnection(databasePath);
  const repository = new DashboardRepository(db);
  const service = new DashboardService(repository);

  return { db, repository, service, sqlite };
}

describe("DashboardService", () => {
  it("aggregates daily, monthly, and yearly stats in database queries", () => {
    const { db, repository, service, sqlite } = createDashboard();

    db.insert(rides)
      .values([
        { rideDate: "2026-04-02", distanceKm: 10, averageSpeedKmh: 20, maxSpeedKmh: 30 },
        { rideDate: "2026-04-02", distanceKm: 12.25, averageSpeedKmh: 22, maxSpeedKmh: 35 },
        { rideDate: "2026-05-02", distanceKm: 30, averageSpeedKmh: 25, maxSpeedKmh: 40 },
        { rideDate: "2025-04-02", distanceKm: 5, averageSpeedKmh: null, maxSpeedKmh: 28 }
      ])
      .run();

    const daily = service.getMonthMetrics(2026, 4);
    const monthly = service.getYearMetrics(2026);
    const yearly = service.getAllYearsMetrics();

    expect(daily).toMatchObject({
      totalDistanceKm: 22.3,
      rideCount: 2,
      averageDistanceKm: 11.1,
      longestRideKm: 12.3,
      averageSpeedKmh: 21,
      maxSpeedKmh: 35
    });
    expect(daily.dayMetrics).toHaveLength(30);
    expect(daily.dayMetrics[0]).toEqual({
      rideDate: "2026-04-01",
      totalDistanceKm: 0,
      rideCount: 0,
      averageDistanceKm: 0,
      longestRideKm: 0,
      averageSpeedKmh: null,
      maxSpeedKmh: null
    });
    expect(daily.dayMetrics[1]).toEqual({
      rideDate: "2026-04-02",
      totalDistanceKm: 22.3,
      rideCount: 2,
      averageDistanceKm: 11.1,
      longestRideKm: 12.3,
      averageSpeedKmh: 21,
      maxSpeedKmh: 35
    });
    expect(daily.dayMetrics[29].rideDate).toBe("2026-04-30");

    expect(monthly.monthMetrics[3]).toEqual({
      month: 4,
      totalDistanceKm: 22.3,
      rideCount: 2,
      averageDistanceKm: 11.1,
      longestRideKm: 12.3,
      averageSpeedKmh: 21,
      maxSpeedKmh: 35
    });
    expect(monthly.monthMetrics[4]).toEqual({
      month: 5,
      totalDistanceKm: 30,
      rideCount: 1,
      averageDistanceKm: 30,
      longestRideKm: 30,
      averageSpeedKmh: 25,
      maxSpeedKmh: 40
    });

    expect(yearly.yearMetrics).toEqual([
      {
        year: 2025,
        totalDistanceKm: 5,
        rideCount: 1,
        averageDistanceKm: 5,
        longestRideKm: 5,
        averageSpeedKmh: null,
        maxSpeedKmh: 28
      },
      {
        year: 2026,
        totalDistanceKm: 52.3,
        rideCount: 3,
        averageDistanceKm: 17.4,
        longestRideKm: 30,
        averageSpeedKmh: 22.3,
        maxSpeedKmh: 40
      }
    ]);

    sqlite.close();
  });

  it("returns empty buckets when there are no rides", () => {
    const { repository, service, sqlite } = createDashboard();

    const daily = service.getMonthMetrics(2026, 4);
    const monthly = service.getYearMetrics(2026);
    const yearly = service.getAllYearsMetrics();

    expect(daily).toMatchObject({ totalDistanceKm: 0, rideCount: 0, averageDistanceKm: 0, longestRideKm: 0 });
    expect(daily.averageSpeedKmh).toBeNull();
    expect(daily.dayMetrics).toHaveLength(30);
    expect(monthly.monthMetrics).toHaveLength(12);
    expect(yearly.yearMetrics).toEqual([]);

    sqlite.close();
  });
});
