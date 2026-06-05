import type { FastifyRequest } from "fastify";
import type { SettingsUpdate } from "./settings.domain.js";
import { settingsUpdateSchema, type SettingsUpdateInput } from "./settings.schema.js";
import type { SettingsService } from "./settings.service.js";

export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  get = async () => this.settings.getSettings();

  update = async (request: FastifyRequest) => {
    const validatedUpdate = settingsUpdateSchema.parse(request.body);
    return this.settings.updateSettings(this.toDomain(validatedUpdate));
  };

  private toDomain(validatedUpdate: SettingsUpdateInput): SettingsUpdate {
    return {
      homeLocationId: validatedUpdate.homeLocationId,
      useMetricSystem: validatedUpdate.useMetricSystem
    };
  }
}
