import { describe, expect, it } from "vitest";
import { windDirectionToCardinal } from "../src/modules/weather/weather.service.js";

describe("windDirectionToCardinal", () => {
  it.each([
    [0, "N"],
    [44, "NE"],
    [90, "E"],
    [181, "S"],
    [270, "W"],
    [359, "N"]
  ])("maps %i degrees to %s", (degrees, cardinal) => {
    expect(windDirectionToCardinal(degrees)).toBe(cardinal);
  });
});
