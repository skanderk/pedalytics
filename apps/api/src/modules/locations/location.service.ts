import type { LocationDetails } from "./location.domain.js";
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

  createLocation(input: LocationDetails) {
    return this.locations.create(input);
  }

  updateLocation(id: number, input: LocationDetails) {
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
