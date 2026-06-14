import type { Ride } from "../rides/ride.domain.js";
import type { DashboardQuery } from "./dashboard.schema.js";

// TODO - Split interface into a base interface with common fields and 
// separate interfaces for day, month, and year buckets.
export interface DashboardStats {
  // TODO 
  totalDistanceKm: number;
  rideCount: number;
  averageDistanceKm: number;
  longestRideKm: number;
  distanceByDay: Array<DashboardBucket & { rideDate: string }>;
  distanceByMonth: Array<DashboardBucket & { month: number }>;
  distanceByYear: Array<DashboardBucket & { year: number }>;
}

interface DashboardBucket {
  distanceKm: number;
  averageSpeedKmh: number | null;
  maxSpeedKmh: number | null;
}

export function aggregateDashboardStats(rides: Ride[], query: DashboardQuery): DashboardStats {
  // TODO - Current logic i.e. getting all rides from DB, then filtering and aggregating in memory is not efficient. 
  // We should push down filtering and aggregation to DB level.
  const filtered = rides.filter((ride) => {
    const [year, month] = ride.rideDate.split("-").map(Number);
    return (!query.year || year === query.year) && (!query.month || month === query.month);
  });

  const totalDistanceKm = roundDistance(filtered.reduce((sum, ride) => sum + ride.distanceKm, 0));
  const longestRideKm = roundDistance(filtered.reduce((longest, ride) => Math.max(longest, ride.distanceKm), 0));

  return {
    totalDistanceKm,
    rideCount: filtered.length,
    averageDistanceKm: filtered.length ? roundDistance(totalDistanceKm / filtered.length) : 0,
    longestRideKm,
    distanceByDay: aggregateDistanceByDay(filtered, query),
    distanceByMonth: aggregateDistanceByMonth(rides, query),
    distanceByYear: aggregateDistanceByYear(rides)
  };
}

function aggregateDistanceByDay(rides: Ride[], query: DashboardQuery) {
  const byDay = new Map<string, Ride[]>();

  for (const ride of rides) {
    byDay.set(ride.rideDate, [...(byDay.get(ride.rideDate) ?? []), ride]);
  }

  if (!query.year || !query.month) {
    return [...byDay.entries()].map(([rideDate, dayRides]) => ({ rideDate, ...aggregateBucket(dayRides) }));
  }

  return Array.from({ length: daysInMonth(query.year, query.month) }, (_, index) => {
    const rideDate = `${query.year}-${String(query.month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    return { rideDate, ...aggregateBucket(byDay.get(rideDate) ?? []) };
  });
}

function aggregateDistanceByMonth(rides: Ride[], query: DashboardQuery) {
  const year = query.year;
  const byMonth = new Map<number, Ride[]>();

  for (const ride of rides) {
    const [rideYear, rideMonth] = ride.rideDate.split("-").map(Number);
    if (year && rideYear !== year) continue;
    byMonth.set(rideMonth, [...(byMonth.get(rideMonth) ?? []), ride]);
  }

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { month, ...aggregateMonthBucket(byMonth.get(month) ?? []) };
  });
}

function aggregateDistanceByYear(rides: Ride[]) {
  const byYear = new Map<number, Ride[]>();

  for (const ride of rides) {
    const [year] = ride.rideDate.split("-").map(Number);
    byYear.set(year, [...(byYear.get(year) ?? []), ride]);
  }

  if (!byYear.size) return [];

  const years = [...byYear.keys()];
  const startYear = Math.min(...years);
  const endYear = Math.max(...years);

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    return { year, ...aggregateYearBucket(byYear.get(year) ?? []) };
  });
}

function aggregateBucket(rides: Ride[]): DashboardBucket {
  return aggregateBucketWithAverageSpeed(rides, averageRideSpeed(rides));
}

function aggregateBucketWithAverageSpeed(rides: Ride[], averageSpeedKmh: number | null): DashboardBucket {
  const maxSpeeds = rides.flatMap((ride) => (ride.maxSpeedKmh === null ? [] : [ride.maxSpeedKmh]));

  return {
    distanceKm: roundDistance(rides.reduce((sum, ride) => sum + ride.distanceKm, 0)),
    averageSpeedKmh,
    maxSpeedKmh: maxSpeeds.length ? roundSpeed(Math.max(...maxSpeeds)) : null
  };
}

function aggregateMonthBucket(rides: Ride[]): DashboardBucket {
  const dailyAverageSpeeds = averageSpeedsByGroup(rides, (ride) => ride.rideDate);
  return aggregateBucketWithAverageSpeed(rides, averageSpeed(dailyAverageSpeeds));
}

function aggregateYearBucket(rides: Ride[]): DashboardBucket {
  const monthlyAverageSpeeds = averageSpeedsByGroup(rides, (ride) => ride.rideDate.slice(0, 7), aggregateMonthBucket);
  return aggregateBucketWithAverageSpeed(rides, averageSpeed(monthlyAverageSpeeds));
}

function averageSpeedsByGroup(rides: Ride[], groupKey: (ride: Ride) => string, aggregateGroup = aggregateBucket) {
  const groups = new Map<string, Ride[]>();

  for (const ride of rides) {
    const key = groupKey(ride);
    groups.set(key, [...(groups.get(key) ?? []), ride]);
  }

  return [...groups.values()].flatMap((groupRides) => {
    const speed = aggregateGroup(groupRides).averageSpeedKmh;
    return speed === null ? [] : [speed];
  });
}

// TODO -A missing value for average should not contribute to the avaerage speed of the bucket.
// Simplify logic by not using the intermediate arrays for average sppeds. 
function averageRideSpeed(rides: Ride[]) {
  return averageSpeed(rides.flatMap((ride) => (ride.averageSpeedKmh === null ? [] : [ride.averageSpeedKmh])));
}

// We estimate average speed for month and year buckets by averaging the average speeds of their respective day and month buckets.
// This is not 100% accurate, though it is our best option without access to accurate ride durations.
function averageSpeed(speeds: number[]) {
  return speeds.length ? roundSpeed(speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length) : null;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function roundDistance(value: number) {
  return Math.round(value * 10) / 10;
}

function roundSpeed(value: number) {
  return Math.round(value * 10) / 10;
}
