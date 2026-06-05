import type { AppSettingsRecord, NewAppSettingsRecord } from "../../db/schema.js";
import { Settings, type SettingsUpdate } from "./settings.domain.js";

/**
 * Maps Drizzle ORM records to domain models and vice versa for user settings.
 */
export class SettingsPersistenceMapper {
  toDomain(record: AppSettingsRecord): Settings {
    return new Settings(record.homeLocationId, record.useMetricSystem);
  }

  toRecord(input: SettingsUpdate): NewAppSettingsRecord {
    const record: NewAppSettingsRecord = {};

    if (input.homeLocationId !== undefined) {
      record.homeLocationId = input.homeLocationId;
    }

    if (input.useMetricSystem !== undefined) {
      record.useMetricSystem = input.useMetricSystem;
    }

    return record;
  }
}
