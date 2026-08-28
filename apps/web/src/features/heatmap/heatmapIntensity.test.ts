import { describe, expect, it } from "vitest";
import { heatmapIntensity } from "./heatmapIntensity";

describe("heatmapIntensity", () => {
  it("normalizes visits against the busiest destination", () => {
    expect(heatmapIntensity(0, 8)).toBe(0);
    expect(heatmapIntensity(1, 8)).toBe(0.125);
    expect(heatmapIntensity(3, 8)).toBe(0.375);
    expect(heatmapIntensity(8, 8)).toBe(1);
    expect(heatmapIntensity(12, 8)).toBe(1);
    expect(heatmapIntensity(1, 0)).toBe(0);
    expect(heatmapIntensity(Number.NaN, 8)).toBe(0);
  });
});
