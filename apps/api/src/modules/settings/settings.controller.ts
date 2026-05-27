import type { FastifyRequest } from "fastify";
import { settingsUpdateSchema } from "./settings.schema.js";
import type { SettingsService } from "./settings.service.js";

export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  get = async () => this.settings.getSettings();

  update = async (request: FastifyRequest) => {
    const input = settingsUpdateSchema.parse(request.body);
    return this.settings.updateSettings(input);
  };
}
