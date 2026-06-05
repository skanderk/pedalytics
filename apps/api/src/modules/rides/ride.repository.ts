import { asc, desc, eq } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { rides } from "../../db/schema.js";
import type { Ride, RideDetailsWithWeather } from "./ride.domain.js";
import type { RidePersistenceMapper } from "./ride.persistence-mapper.js";

export class RideRepository {
  constructor(
    private readonly db: PedalyticsDatabase,
    private readonly mapper: RidePersistenceMapper
  ) {}

  list(): Ride[] {
    return this.db
      .select()
      .from(rides)
      .orderBy(desc(rides.rideDate), desc(rides.id))
      .all()
      .map((ride) => this.mapper.toDomain(ride));
  }

  listAscending(): Ride[] {
    return this.db
      .select()
      .from(rides)
      .orderBy(asc(rides.rideDate), asc(rides.id))
      .all()
      .map((ride) => this.mapper.toDomain(ride));
  }

  findById(id: number): Ride | undefined {
    const ride = this.db.select().from(rides).where(eq(rides.id, id)).get();
    return ride ? this.mapper.toDomain(ride) : undefined;
  }

  listByRideDate(rideDate: string): Ride[] {
    return this.db
      .select()
      .from(rides)
      .where(eq(rides.rideDate, rideDate))
      .orderBy(asc(rides.startedAt), asc(rides.id))
      .all()
      .map((ride) => this.mapper.toDomain(ride));
  }

  create(input: RideDetailsWithWeather): Ride {
    return this.mapper.toDomain(this.db.insert(rides).values(this.mapper.toRecord(input)).returning().get());
  }

  update(id: number, input: RideDetailsWithWeather): Ride | undefined {
    const ride = this.db
      .update(rides)
      .set({ ...this.mapper.toRecord(input), updatedAt: new Date().toISOString() })
      .where(eq(rides.id, id))
      .returning()
      .get();

    return ride ? this.mapper.toDomain(ride) : undefined;
  }

  delete(id: number): boolean {
    const result = this.db.delete(rides).where(eq(rides.id, id)).run();
    return result.changes > 0;
  }
}
