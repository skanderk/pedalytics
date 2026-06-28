import type { FastifyRequest } from "fastify";
import { dashboardDailyQuerySchema, dashboardMonthlyQuerySchema } from "./dashboard.schema.js";
import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  daily = async (request: FastifyRequest) => {
    const query = dashboardDailyQuerySchema.parse(request.query);
    return this.service.getMonthMetrics(query.year, query.month);
  };

  monthly = async (request: FastifyRequest) => {
    const query = dashboardMonthlyQuerySchema.parse(request.query);
    return this.service.getYearMetrics(query.year);
  };

  yearly = async () => {
    return this.service.getAllYearsMetrics();
  };
}
