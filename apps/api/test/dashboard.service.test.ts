import { describe, expect, it } from "vitest";
import { aggregateDashboardStats } from "../src/modules/dashboard/dashboard.service.js";
import { Ride } from "../src/modules/rides/ride.domain.js";

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
  maxSpeedKmh: null,
  averageSpeedKmh: null
};

describe("aggregateDashboardStats", () => {
  it("filters by month and groups distance by day, month, and year", () => {
    const stats = aggregateDashboardStats(
      [
        new Ride({ ...baseRide, id: 1, rideDate: "2026-04-02", distanceKm: 10, averageSpeedKmh: 20, maxSpeedKmh: 30 }),
        new Ride({ ...baseRide, id: 2, rideDate: "2026-04-02", distanceKm: 12.25, averageSpeedKmh: 22, maxSpeedKmh: 35 }),
        new Ride({ ...baseRide, id: 3, rideDate: "2026-05-02", distanceKm: 30, averageSpeedKmh: 25, maxSpeedKmh: 40 }),
        new Ride({ ...baseRide, id: 4, rideDate: "2025-04-02", distanceKm: 5, averageSpeedKmh: 18, maxSpeedKmh: 28 })
      ],
      { year: 2026, month: 4 }
    );

    expect(stats.totalDistanceKm).toBe(22.3);
    expect(stats.rideCount).toBe(2);
    expect(stats.averageDistanceKm).toBe(11.2);
    expect(stats.longestRideKm).toBe(12.3);
    expect(stats.distanceByDay).toHaveLength(30);
    expect(stats.distanceByDay[0]).toEqual({ rideDate: "2026-04-01", distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null });
    expect(stats.distanceByDay[1]).toEqual({ rideDate: "2026-04-02", distanceKm: 22.3, averageSpeedKmh: 21, maxSpeedKmh: 35 });
    expect(stats.distanceByDay[29]).toEqual({ rideDate: "2026-04-30", distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null });
    expect(stats.distanceByMonth).toEqual([
      { month: 1, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 2, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 3, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 4, distanceKm: 22.3, averageSpeedKmh: 21, maxSpeedKmh: 35 },
      { month: 5, distanceKm: 30, averageSpeedKmh: 25, maxSpeedKmh: 40 },
      { month: 6, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 7, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 8, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 9, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 10, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 11, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null },
      { month: 12, distanceKm: 0, averageSpeedKmh: null, maxSpeedKmh: null }
    ]);
    expect(stats.distanceByYear).toEqual([
      { year: 2025, distanceKm: 5, averageSpeedKmh: 18, maxSpeedKmh: 28 },
      { year: 2026, distanceKm: 52.3, averageSpeedKmh: 23, maxSpeedKmh: 40 }
    ]);
  });

  it("returns empty yearly stats when there are no rides", () => {
    const stats = aggregateDashboardStats([], { year: 2026, month: 4 });

    expect(stats).toMatchObject({
      totalDistanceKm: 0,
      rideCount: 0,
      averageDistanceKm: 0,
      longestRideKm: 0,
      distanceByYear: []
    });
    expect(stats.distanceByDay).toHaveLength(30);
    expect(stats.distanceByMonth).toHaveLength(12);
  });
});
