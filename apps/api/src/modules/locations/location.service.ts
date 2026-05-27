import type { LocationCreateInput, LocationUpdateInput } from "./location.schema.js";
import type { LocationRepository } from "./location.repository.js";

export class LocationService {
  constructor(private readonly locations: LocationRepository) {}

  listLocations() {
    return this.locations.list();
  }

  getLocation(id: number) {
    const location = this.locations.findById(id);
    if (!location) {
      throw new Error("LOCATION_NOT_FOUND");
    }
    return location;
  }

  createLocation(input: LocationCreateInput) {
    return this.locations.create(input);
  }

  updateLocation(id: number, input: LocationUpdateInput) {
    const location = this.locations.update(id, input);
    if (!location) {
      throw new Error("LOCATION_NOT_FOUND");
    }
    return location;
  }

  deleteLocation(id: number) {
    if (!this.locations.delete(id)) {
      throw new Error("LOCATION_NOT_FOUND");
    }
  }
}
