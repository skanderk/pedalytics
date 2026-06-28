/**
 * Core ride metrics for a period or for an aggregate result.
 */
export interface RideMetrics {
  totalDistanceKm: number | null;
  rideCount: number;
  averageDistanceKm: number | null;
  longestRideKm: number | null;
  averageSpeedKmh: number | null;
  maxSpeedKmh: number | null;
}

export interface MetricsByDay extends RideMetrics {
  rideDate: string;
}

export interface MetricsByMonth extends RideMetrics {
  month: number;
}

export interface MetricsByYear extends RideMetrics {
  year: number;
}

export interface MonthMetricsReport extends RideMetrics {
  dayMetrics: MetricsByDay[];
}

export interface YearMetricsReport extends RideMetrics {
  monthMetrics: MetricsByMonth[];
}

export interface AllYearsMetricsReport extends RideMetrics {
  yearMetrics: MetricsByYear[];
}

