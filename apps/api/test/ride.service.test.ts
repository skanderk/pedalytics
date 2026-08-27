import { describe, expect, it } from "vitest";
import type { LocationRepository } from "../src/modules/locations/location.repository.js";
import { Ride, type RideDetailsWithWeather } from "../src/modules/rides/ride.domain.js";
import type { RideRepository } from "../src/modules/rides/ride.repository.js";
import { RideService } from "../src/modules/rides/ride.service.js";
import type { WeatherProvider } from "../src/modules/weather/weather.service.js";

const baseRide = new Ride({
  id: 1,
  rideDate: "2026-05-01",
  startedAt: "08:00",
  endedAt: "09:00",
  distanceKm: 10,
  maxSpeedKmh: null,
  averageSpeedKmh: null,
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
  weatherCode: null
});

function buildService(existingRides: Ride[]) {
  const repository = {
    list: () => existingRides,
    listPage: (page: number, pageSize: number) => existingRides.slice((page - 1) * pageSize, page * pageSize),
    count: () => existingRides.length,
    listAscending: () => existingRides,
    findById: (id: number) => existingRides.find((ride) => ride.id === id),
    listByRideDate: (rideDate: string) => existingRides.filter((ride) => ride.rideDate === rideDate),
    create: (input: RideDetailsWithWeather) => new Ride({ ...baseRide, ...input, id: 99 }),
    update: (id: number, input: RideDetailsWithWeather) => new Ride({ ...baseRide, ...input, id }),
    delete: () => true
  } as unknown as RideRepository;

  const locations = {
    findById: () => undefined
  } as unknown as LocationRepository;

  const weather = {
    getSnapshot: async () => {
      throw new Error("Weather should not be fetched without a departure location");
    }
  } satisfies WeatherProvider;

  return new RideService(repository, locations, weather);
}

describe("RideService", () => {
  it("returns rides with pagination metadata", () => {
    const rides = Array.from({ length: 12 }, (_, index) => new Ride({ ...baseRide, id: index + 1 }));
    const service = buildService(rides);

    expect(service.listRides({ page: 2, pageSize: 10 })).toMatchObject({
      items: rides.slice(10),
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2
    });
  });

  it("rejects creating a ride that overlaps an existing ride on the same date", async () => {
    const service = buildService([baseRide]);

    await expect(
      service.createRide({
        rideDate: "2026-05-01",
        startedAt: "08:30",
        endedAt: "09:30",
        distanceKm: 12
      })
    ).rejects.toThrow("RIDE_TIME_OVERLAP");
  });

  it("allows creating a ride that starts when an existing ride ends", async () => {
    const service = buildService([baseRide]);

    await expect(
      service.createRide({
        rideDate: "2026-05-01",
        startedAt: "09:00",
        endedAt: "10:00",
        distanceKm: 12
      })
    ).resolves.toMatchObject({
      rideDate: "2026-05-01",
      startedAt: "09:00",
      endedAt: "10:00"
    });
  });

  it("allows creating an overlapping time span on a different date", async () => {
    const service = buildService([baseRide]);

    await expect(
      service.createRide({
        rideDate: "2026-05-02",
        startedAt: "08:30",
        endedAt: "09:30",
        distanceKm: 12
      })
    ).resolves.toMatchObject({
      rideDate: "2026-05-02",
      startedAt: "08:30",
      endedAt: "09:30"
    });
  });

  it("allows creating a ride without a complete time span", async () => {
    const service = buildService([baseRide]);

    await expect(
      service.createRide({
        rideDate: "2026-05-01",
        startedAt: "08:30",
        endedAt: null,
        distanceKm: 12
      })
    ).resolves.toMatchObject({
      rideDate: "2026-05-01",
      startedAt: "08:30",
      endedAt: null
    });
  });

  it("ignores the current ride when checking overlap during update", async () => {
    const service = buildService([baseRide]);

    await expect(
      service.updateRide(1, {
        rideDate: "2026-05-01",
        startedAt: "08:15",
        endedAt: "08:45",
        distanceKm: 12
      })
    ).resolves.toMatchObject({
      id: 1,
      startedAt: "08:15",
      endedAt: "08:45"
    });
  });

  it("rejects updating a ride to overlap another ride", async () => {
    const service = buildService([
      baseRide,
      new Ride({ ...baseRide, id: 2, startedAt: "10:00", endedAt: "11:00" })
    ]);

    await expect(
      service.updateRide(2, {
        rideDate: "2026-05-01",
        startedAt: "08:30",
        endedAt: "09:30",
        distanceKm: 12
      })
    ).rejects.toThrow("RIDE_TIME_OVERLAP");
  });
});
