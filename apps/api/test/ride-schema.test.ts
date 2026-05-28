import { describe, expect, it } from "vitest";
import { rideCreateSchema } from "../src/modules/rides/ride.schema.js";

describe("rideCreateSchema", () => {
  it("allows legacy ride input with only date and distance", () => {
    const parsed = rideCreateSchema.parse({
      rideDate: "2026-01-12",
      distanceKm: 14.2
    });

    expect(parsed.destinationLocationId).toBeUndefined();
    expect(parsed.distanceKm).toBe(14.2);
  });

  it("allows optional positive max and average speed metrics", () => {
    const parsed = rideCreateSchema.parse({
      rideDate: "2026-01-12",
      distanceKm: 14.2,
      maxSpeedKmh: 28.4,
      averageSpeedKmh: 21.6
    });

    expect(parsed.maxSpeedKmh).toBe(28.4);
    expect(parsed.averageSpeedKmh).toBe(21.6);
  });

  it("rejects non-positive optional speed metrics", () => {
    const result = rideCreateSchema.safeParse({
      rideDate: "2026-01-12",
      distanceKm: 14.2,
      maxSpeedKmh: 0,
      averageSpeedKmh: -1
    });

    expect(result.success).toBe(false);
  });

  it("rejects future ride dates", () => {
    const result = rideCreateSchema.safeParse({
      rideDate: "2999-01-01",
      distanceKm: 14.2
    });

    expect(result.success).toBe(false);
  });
});
