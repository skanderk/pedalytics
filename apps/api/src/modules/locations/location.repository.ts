import { asc, eq } from "drizzle-orm";
import { locations, type LocationRecord, type NewLocationRecord } from "../../db/schema.js";
import type { PedalyticsDatabase } from "../../db/client.js";

export class LocationRepository {
  constructor(private readonly db: PedalyticsDatabase) {}

  list(): LocationRecord[] {
    return this.db.select().from(locations).orderBy(asc(locations.name)).all();
  }

  findById(id: number): LocationRecord | undefined {
    return this.db.select().from(locations).where(eq(locations.id, id)).get();
  }

  create(input: NewLocationRecord): LocationRecord {
    return this.db.insert(locations).values(input).returning().get();
  }

  update(id: number, input: NewLocationRecord): LocationRecord | undefined {
    return this.db
      .update(locations)
      .set({ ...input, updatedAt: new Date().toISOString() })
      .where(eq(locations.id, id))
      .returning()
      .get();
  }

  delete(id: number): boolean {
    const result = this.db.delete(locations).where(eq(locations.id, id)).run();
    return result.changes > 0;
  }
}
