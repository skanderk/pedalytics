import type { SettingsUpdateInput } from "./settings.schema.js";
import type { SettingsRepository } from "./settings.repository.js";

export interface AppSettingsDto {
  homeLocationId: number | null;
  useMetricSystem: boolean;
}

export class SettingsService {
  constructor(private readonly settings: SettingsRepository) {}

  getSettings() {
    return this.toDto(this.settings.get());
  }

  updateSettings(input: SettingsUpdateInput) {
    return this.toDto(this.settings.update(input));
  }

  private toDto(settings: { homeLocationId: number | null; useMetricSystem: boolean }): AppSettingsDto {
    return {
      homeLocationId: settings.homeLocationId,
      useMetricSystem: settings.useMetricSystem
    };
  }
}
