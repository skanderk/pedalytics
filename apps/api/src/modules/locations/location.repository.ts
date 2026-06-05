import { asc, eq } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { locations } from "../../db/schema.js";
import type { Location, LocationDetails } from "./location.domain.js";
import type { LocationPersistenceMapper } from "./location.persistence-mapper.js";

export class LocationRepository {
  constructor(
    private readonly db: PedalyticsDatabase,
    private readonly mapper: LocationPersistenceMapper
  ) {}

  list(): Location[] {
    return this.db
      .select()
      .from(locations)
      .orderBy(asc(locations.name))
      .all()
      .map((location) => this.mapper.toDomain(location));
  }

  findById(id: number): Location | undefined {
    const location = this.db.select().from(locations).where(eq(locations.id, id)).get();
    return location ? this.mapper.toDomain(location) : undefined;
  }

  create(locationDetails: LocationDetails): Location {
    return this.mapper.toDomain(this.db.insert(locations).values(this.mapper.toRecord(locationDetails)).returning().get());
  }

  update(id: number, locationDetails: LocationDetails): Location | undefined {
    const location = this.db
      .update(locations)
      .set({ ...this.mapper.toRecord(locationDetails), updatedAt: new Date().toISOString() })
      .where(eq(locations.id, id))
      .returning()
      .get();

    return location ? this.mapper.toDomain(location) : undefined;
  }

  delete(id: number): boolean {
    const result = this.db.delete(locations).where(eq(locations.id, id)).run();
    return result.changes > 0;
  }
}
