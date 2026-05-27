import { describe, expect, it } from "vitest";
import type { RideRecord } from "../src/db/schema.js";
import { aggregateDashboardStats } from "../src/modules/dashboard/dashboard.service.js";

const baseRide = {
  id: 1,
  startedAt: null,
  endedAt: null,
  departureLocationId: null,
  destinationLocationId: null,
  notes: null,
  weatherTemperatureCelsius: null,
  weatherFeelsLikeCelsius: null,
  weatherPrecipitationMm: null,
  weatherRainMm: null,
  weatherWindSpeedKmh: null,
  weatherWindDirectionDegrees: null,
  weatherWindDirectionCardinal: null,
  weatherCode: null,
  weatherFetchedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("aggregateDashboardStats", () => {
  it("filters by month and groups distance by day", () => {
    const stats = aggregateDashboardStats(
      [
        { ...baseRide, id: 1, rideDate: "2026-04-02", distanceKm: 10 },
        { ...baseRide, id: 2, rideDate: "2026-04-02", distanceKm: 12.25 },
        { ...baseRide, id: 3, rideDate: "2026-05-02", distanceKm: 30 }
      ] satisfies RideRecord[],
      { year: 2026, month: 4 }
    );

    expect(stats).toEqual({
      totalDistanceKm: 22.3,
      rideCount: 2,
      averageDistanceKm: 11.2,
      longestRideKm: 12.3,
      distanceByDay: [{ rideDate: "2026-04-02", distanceKm: 22.3 }]
    });
  });
});
