import type { FastifyInstance } from "fastify";
import { DashboardRepository } from "./dashboard.repository.js";
import { DashboardController } from "./dashboard.controller.js";
import { DashboardService } from "./dashboard.service.js";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const repository = new DashboardRepository(app.db);
  const service = new DashboardService(repository);
  const controller = new DashboardController(service);
  app.get("/api/dashboard/daily", controller.daily);
  app.get("/api/dashboard/monthly", controller.monthly);
  app.get("/api/dashboard/yearly", controller.yearly);
}
