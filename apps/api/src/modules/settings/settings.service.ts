import type { SettingsUpdateInput } from "./settings.schema.js";
import type { SettingsRepository } from "./settings.repository.js";

export class SettingsService {
  constructor(private readonly settings: SettingsRepository) {}

  getSettings() {
    return this.settings.get();
  }

  updateSettings(input: SettingsUpdateInput) {
    return this.settings.update(input);
  }
}
