import type { LocationRecord, NewLocationRecord } from "../../db/schema.js";
import { Location, type LocationDetails } from "./location.domain.js";

/**
 * Two-Way mapper for converting between Location domain models and Drizzle records.
 */
export class LocationPersistenceMapper {
  toDomain(record: LocationRecord): Location {
    return new Location(
      record.id,
      record.name,
      record.address,
      record.city,
      record.provinceState,
      record.country,
      record.zipCode,
      record.latitude,
      record.longitude
    );
  }

  toRecord(input: LocationDetails): NewLocationRecord {
    const record: NewLocationRecord = {
      name: input.name,
      city: input.city,
      country: input.country
    };

    if (input.address !== undefined) {
      record.address = input.address;
    }

    if (input.provinceState !== undefined) {
      record.provinceState = input.provinceState;
    }

    if (input.zipCode !== undefined) {
      record.zipCode = input.zipCode;
    }

    if (input.latitude !== undefined) {
      record.latitude = input.latitude;
    }

    if (input.longitude !== undefined) {
      record.longitude = input.longitude;
    }

    return record;
  }
}
