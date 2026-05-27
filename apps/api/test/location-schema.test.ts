import { describe, expect, it } from "vitest";
import { locationCreateSchema } from "../src/modules/locations/location.schema.js";

describe("locationCreateSchema", () => {
  it("accepts a nullable province or state", () => {
    const parsed = locationCreateSchema.parse({
      name: "Cafe",
      city: "Montreal",
      provinceState: null,
      country: "Canada"
    });

    expect(parsed.provinceState).toBeNull();
  });
});
