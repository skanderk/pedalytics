import type { Ride } from "../rides/ride.domain.js";
import type { DashboardQuery } from "./dashboard.schema.js";

export interface DashboardStats {
  totalDistanceKm: number;
  rideCount: number;
  averageDistanceKm: number;
  longestRideKm: number;
  distanceByDay: Array<{ rideDate: string; distanceKm: number }>;
}

export function aggregateDashboardStats(rides: Ride[], query: DashboardQuery): DashboardStats {
  const filtered = rides.filter((ride) => {
    const [year, month] = ride.rideDate.split("-").map(Number);
    return (!query.year || year === query.year) && (!query.month || month === query.month);
  });

  const totalDistanceKm = roundDistance(filtered.reduce((sum, ride) => sum + ride.distanceKm, 0));
  const longestRideKm = roundDistance(filtered.reduce((longest, ride) => Math.max(longest, ride.distanceKm), 0));
  const byDay = new Map<string, number>();

  for (const ride of filtered) {
    byDay.set(ride.rideDate, roundDistance((byDay.get(ride.rideDate) ?? 0) + ride.distanceKm));
  }

  return {
    totalDistanceKm,
    rideCount: filtered.length,
    averageDistanceKm: filtered.length ? roundDistance(totalDistanceKm / filtered.length) : 0,
    longestRideKm,
    distanceByDay: [...byDay.entries()].map(([rideDate, distanceKm]) => ({ rideDate, distanceKm }))
  };
}

function roundDistance(value: number) {
  return Math.round(value * 10) / 10;
}
