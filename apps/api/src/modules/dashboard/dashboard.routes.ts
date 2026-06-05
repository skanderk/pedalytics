import type { FastifyInstance } from "fastify";
import { RidePersistenceMapper } from "../rides/ride.persistence-mapper.js";
import { RideRepository } from "../rides/ride.repository.js";
import { DashboardController } from "./dashboard.controller.js";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const controller = new DashboardController(new RideRepository(app.db, new RidePersistenceMapper()));
  app.get("/api/dashboard", controller.get);
}
