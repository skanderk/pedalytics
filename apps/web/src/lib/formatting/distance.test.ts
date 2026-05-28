import { describe, expect, it } from "vitest";
import { formatKilometers, formatOptionalKilometersPerHour } from "./distance";

describe("formatKilometers", () => {
  it("formats metric ride distances with one decimal when needed", () => {
    expect(formatKilometers(18.75)).toBe("18.8 km");
    expect(formatOptionalKilometersPerHour(null)).toBe("n/a");
    expect(formatOptionalKilometersPerHour(12)).toBe("12 km/h");
  });
});
