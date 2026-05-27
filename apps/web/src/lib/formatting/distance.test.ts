import { describe, expect, it } from "vitest";
import { formatKilometers } from "./distance";

describe("formatKilometers", () => {
  it("formats metric ride distances with one decimal when needed", () => {
    expect(formatKilometers(18.75)).toBe("18.8 km");
  });
});
