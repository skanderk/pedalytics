import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { locations, rides } from "../../db/schema.js";
import type { DestinationVisit, Ride, RideDetailsWithWeather } from "./ride.domain.js";
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

  listPage(page: number, pageSize: number): Ride[] {
    return this.db
      .select()
      .from(rides)
      .orderBy(desc(rides.rideDate), desc(rides.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all()
      .map((ride) => this.mapper.toDomain(ride));
  }

  count(): number {
    return this.db.select({ value: count() }).from(rides).get()?.value ?? 0;
  }

  listDestinationVisits(): DestinationVisit[] {
    const visitCount = count(rides.id);

    return this.db
      .select({
        locationId: locations.id,
        name: locations.name,
        latitude: locations.latitude,
        longitude: locations.longitude,
        visitCount
      })
      .from(rides)
      .innerJoin(locations, eq(rides.destinationLocationId, locations.id))
      .where(and(isNotNull(locations.latitude), isNotNull(locations.longitude)))
      .groupBy(locations.id, locations.name, locations.latitude, locations.longitude)
      .orderBy(desc(visitCount), asc(locations.name))
      .all() as DestinationVisit[];
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
