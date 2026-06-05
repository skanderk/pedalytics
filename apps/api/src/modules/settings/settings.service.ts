import type { SettingsUpdate } from "./settings.domain.js";
import type { SettingsRepository } from "./settings.repository.js";

export class SettingsService {
  constructor(private readonly settings: SettingsRepository) {}

  getSettings() {
    return this.settings.get();
  }

  updateSettings(settingsUpdate: SettingsUpdate) {
    return this.settings.update(settingsUpdate);
  }
}
