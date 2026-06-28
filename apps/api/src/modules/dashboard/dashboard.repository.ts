import { and, gte, lt, sql } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { rides } from "../../db/schema.js";
import type { MetricsByDay, MetricsByMonth, RideMetrics, MetricsByYear } from "./dashboard.types.js";

const aggregateSelection = {
  totalDistanceKm: sql<number | null>`sum(${rides.distanceKm})`,
  rideCount: sql<number>`count(*)`,
  averageDistanceKm: sql<number | null>`avg(${rides.distanceKm})`,
  longestRideKm: sql<number | null>`max(${rides.distanceKm})`,
  averageSpeedKmh: sql<number | null>`avg(${rides.averageSpeedKmh})`,
  maxSpeedKmh: sql<number | null>`max(${rides.maxSpeedKmh})`
};

export class DashboardRepository {
  constructor(private readonly db: PedalyticsDatabase) { }

  metricsByDay(year: number, month: number): MetricsByDay[] {
    const range = monthRange(year, month);

    return this.db
      .select({
        rideDate: rides.rideDate,
        ...aggregateSelection
      })
      .from(rides)
      .where(and(gte(rides.rideDate, range.start), lt(rides.rideDate, range.end)))
      .groupBy(rides.rideDate)
      .orderBy(rides.rideDate)
      .all();
  }

  dailySummaryMetrics(year: number, month: number): RideMetrics {
    const range = monthRange(year, month);
    return this.summaryForRange(range.start, range.end);
  }

  metricsByMonth(year: number): MetricsByMonth[] {
    const month = sql<number>`cast(strftime('%m', ${rides.rideDate}) as integer)`;

    return this.db
      .select({
        month,
        ...aggregateSelection
      })
      .from(rides)
      .where(and(gte(rides.rideDate, `${year}-01-01`), lt(rides.rideDate, `${year + 1}-01-01`)))
      .groupBy(month)
      .orderBy(month)
      .all();
  }

  monthlySummaryMetrics(year: number): RideMetrics {
    return this.summaryForRange(`${year}-01-01`, `${year + 1}-01-01`);
  }

  metricsByYear(): MetricsByYear[] {
    const year = sql<number>`cast(strftime('%Y', ${rides.rideDate}) as integer)`;

    return this.db
      .select({
        year,
        ...aggregateSelection
      })
      .from(rides)
      .groupBy(year)
      .orderBy(year)
      .all();
  }

  yearlySummaryMetrics(): RideMetrics {
    return this.db
      .select(aggregateSelection)
      .from(rides)
      .get() ?? emptyAggregateMetrics();
  }

  private summaryForRange(start: string, end: string): RideMetrics {
    return (
      this.db
        .select(aggregateSelection)
        .from(rides)
        .where(and(gte(rides.rideDate, start), lt(rides.rideDate, end)))
        .get() ?? emptyAggregateMetrics()
    );
  }
}

function monthRange(year: number, month: number) {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`
  };
}

function emptyAggregateMetrics(): RideMetrics {
  return {
    totalDistanceKm: null,
    rideCount: 0,
    averageDistanceKm: null,
    longestRideKm: null,
    averageSpeedKmh: null,
    maxSpeedKmh: null
  };
}
