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
  it("filters by month and groups distance by day", () => {
    const stats = aggregateDashboardStats(
      [
        new Ride({ ...baseRide, id: 1, rideDate: "2026-04-02", distanceKm: 10 }),
        new Ride({ ...baseRide, id: 2, rideDate: "2026-04-02", distanceKm: 12.25 }),
        new Ride({ ...baseRide, id: 3, rideDate: "2026-05-02", distanceKm: 30 })
      ],
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
