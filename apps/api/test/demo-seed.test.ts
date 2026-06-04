import { describe, expect, it } from "vitest";
import { assertSafeDemoDatabasePath, demoEndDate, demoRideCount, generateRideDates, SeededRandom } from "../src/db/seed/demo.js";

describe("demo seed", () => {
  it("refuses to target the real database", () => {
    expect(() => assertSafeDemoDatabasePath("/tmp/pedalytics.db")).toThrow(/real database/);
    expect(() => assertSafeDemoDatabasePath("/tmp/prod.sqlite")).toThrow(/not clearly demo\/test/);
  });

  it("generates deterministic year-round rides with a July peak and sparse winter", () => {
    const dates = generateRideDates(new SeededRandom(0x507eda1));
    const months = dates.map((date) => Number(date.slice(5, 7)));
    const winterCount = months.filter((month) => month <= 3 || month === 12).length;
    const julyCount = months.filter((month) => month === 7).length;
    const januaryCount = months.filter((month) => month === 1).length;

    expect(dates).toHaveLength(demoRideCount);
    expect(new Set(dates).size).toBe(demoRideCount);
    expect(winterCount).toBeGreaterThan(0);
    expect(winterCount).toBeLessThan(demoRideCount * 0.08);
    expect(julyCount).toBeGreaterThan(januaryCount);
    expect(dates[0]).toMatch(/^2021-/);
    expect(dates.at(-1)).toMatch(/^2026-/);
    expect(dates.at(-1)! <= demoEndDate).toBe(true);
  });
});
