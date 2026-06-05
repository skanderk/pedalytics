import type { FastifyInstance } from "fastify";
import { LocationController } from "./location.controller.js";
import { LocationPersistenceMapper } from "./location.persistence-mapper.js";
import { LocationRepository } from "./location.repository.js";
import { LocationService } from "./location.service.js";

export async function registerLocationRoutes(app: FastifyInstance) {
  const mapper = new LocationPersistenceMapper();
  const repository = new LocationRepository(app.db, mapper);
  const service = new LocationService(repository);
  const controller = new LocationController(service);

  app.get("/api/locations", controller.list);
  app.get("/api/locations/:id", controller.get);
  app.post("/api/locations", controller.create);
  app.put("/api/locations/:id", controller.update);
  app.delete("/api/locations/:id", controller.delete);
}
