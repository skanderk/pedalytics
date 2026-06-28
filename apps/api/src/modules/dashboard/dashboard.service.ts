import type { DashboardRepository } from "./dashboardRepository.repository.js";
import type { AllYearsMetricsReport, MetricsByDay, MetricsByMonth, MetricsByYear, MonthMetricsReport, RideMetrics, YearMetricsReport } from "./dashboard.types.js";

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  getMonthMetrics(year: number, month: number): MonthMetricsReport {
    return this.buildMonthMetricsReport(this.dashboardRepository.metricsByDay(year, month), this.dashboardRepository.dailySummaryMetrics(year, month), year, month);
  }

  getYearMetrics(year: number): YearMetricsReport {
    return this.buildYearMetricsReport(this.dashboardRepository.metricsByMonth(year), this.dashboardRepository.monthlySummaryMetrics(year));
  }

  getAllYearsMetrics(): AllYearsMetricsReport {
    return this.buildAllYearMetricsReport(this.dashboardRepository.metricsByYear(), this.dashboardRepository.yearlySummaryMetrics());
  }

  private buildMonthMetricsReport(rows: MetricsByDay[], summary: RideMetrics, year: number, month: number): MonthMetricsReport {
    const byDate = new Map(rows.map((row) => [row.rideDate, this.toMetricsWithSpeed(row)]));

    return {
      ...this.toSummary(summary),
      dayMetrics: Array.from({ length: daysInMonth(year, month) }, (_, index) => {
        const rideDate = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
        return { rideDate, ...(byDate.get(rideDate) ?? emptyMetrics()) };
      })
    };
  }

  private buildYearMetricsReport(rows: MetricsByMonth[], summary: RideMetrics): YearMetricsReport {
    const byMonth = new Map(rows.map((row) => [row.month, this.toMetricsWithSpeed(row)]));

    return {
      ...this.toSummary(summary),
      monthMetrics: Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return { month, ...(byMonth.get(month) ?? emptyMetrics()) };
      })
    };
  }

  private buildAllYearMetricsReport(rows: MetricsByYear[], summary: RideMetrics): AllYearsMetricsReport {
    const byYear = new Map(rows.map((row) => [row.year, this.toMetricsWithSpeed(row)]));
    const years = rows.map((row) => row.year);
    const startYear = years.length ? Math.min(...years) : null;
    const endYear = years.length ? Math.max(...years) : null;

    return {
      ...this.toSummary(summary),
      yearMetrics:
        startYear !== null && endYear !== null
          ? Array.from({ length: endYear - startYear + 1 }, (_, index) => {
              const year = startYear + index;
              return { year, ...(byYear.get(year) ?? emptyMetrics()) };
            })
          : []
    };
  }

  private toMetricsWithSpeed(row: RideMetrics): RideMetrics {
    return {
      ...this.toSummary(row),
      averageSpeedKmh: roundNullable(row.averageSpeedKmh),
      maxSpeedKmh: roundNullable(row.maxSpeedKmh)
    };
  }

  private toSummary(row: RideMetrics): RideMetrics {
    return {
      totalDistanceKm: roundValue(row.totalDistanceKm ?? 0),
      rideCount: row.rideCount,
      averageDistanceKm: roundValue(row.averageDistanceKm ?? 0),
      longestRideKm: roundValue(row.longestRideKm ?? 0),
      averageSpeedKmh: null,
      maxSpeedKmh: null
    };
  }
}

function emptyMetrics(): RideMetrics {
  return {
    totalDistanceKm: 0,
    rideCount: 0,
    averageDistanceKm: 0,
    longestRideKm: 0,
    averageSpeedKmh: null,
    maxSpeedKmh: null
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function roundNullable(value: number | null) {
  return value === null ? null : roundValue(value);
}

function roundValue(value: number) {
  return Math.round(value * 10) / 10;
}
