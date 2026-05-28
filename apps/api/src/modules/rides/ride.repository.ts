import { asc, desc, eq } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { rides, type NewRideRecord, type RideRecord } from "../../db/schema.js";

export class RideRepository {
  constructor(private readonly db: PedalyticsDatabase) {}

  list(): RideRecord[] {
    return this.db.select().from(rides).orderBy(desc(rides.rideDate), desc(rides.id)).all();
  }

  listAscending(): RideRecord[] {
    return this.db.select().from(rides).orderBy(asc(rides.rideDate), asc(rides.id)).all();
  }

  findById(id: number): RideRecord | undefined {
    return this.db.select().from(rides).where(eq(rides.id, id)).get();
  }

  listByRideDate(rideDate: string): RideRecord[] {
    return this.db.select().from(rides).where(eq(rides.rideDate, rideDate)).orderBy(asc(rides.startedAt), asc(rides.id)).all();
  }

  create(input: NewRideRecord): RideRecord {
    return this.db.insert(rides).values(input).returning().get();
  }

  update(id: number, input: NewRideRecord): RideRecord | undefined {
    return this.db
      .update(rides)
      .set({ ...input, updatedAt: new Date().toISOString() })
      .where(eq(rides.id, id))
      .returning()
      .get();
  }

  delete(id: number): boolean {
    const result = this.db.delete(rides).where(eq(rides.id, id)).run();
    return result.changes > 0;
  }
}
