import type { FastifyRequest } from "fastify";
import { dashboardQuerySchema } from "./dashboard.schema.js";
import { aggregateDashboardStats } from "./dashboard.service.js";
import type { RideRepository } from "../rides/ride.repository.js";

export class DashboardController {
  constructor(private readonly rides: RideRepository) {}

  get = async (request: FastifyRequest) => {
    const query = dashboardQuerySchema.parse(request.query);
    return aggregateDashboardStats(this.rides.listAscending(), query);
  };
}
