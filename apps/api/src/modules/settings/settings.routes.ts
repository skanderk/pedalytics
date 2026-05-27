import type { FastifyInstance } from "fastify";
import { SettingsController } from "./settings.controller.js";
import { SettingsRepository } from "./settings.repository.js";
import { SettingsService } from "./settings.service.js";

export async function registerSettingsRoutes(app: FastifyInstance) {
  const repository = new SettingsRepository(app.db);
  const service = new SettingsService(repository);
  const controller = new SettingsController(service);

  app.get("/api/settings", controller.get);
  app.put("/api/settings", controller.update);
}
