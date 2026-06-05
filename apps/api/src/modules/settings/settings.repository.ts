import { eq } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { appSettings } from "../../db/schema.js";
import type { Settings, SettingsUpdate } from "./settings.domain.js";
import type { SettingsPersistenceMapper } from "./settings.persistence-mapper.js";

export class SettingsRepository {
  constructor(
    private readonly db: PedalyticsDatabase,
    private readonly mapper: SettingsPersistenceMapper
  ) {}

  get(): Settings {
    const settings = this.db.select().from(appSettings).where(eq(appSettings.id, 1)).get();
    if (settings) {
      return this.mapper.toDomain(settings);
    }
    return this.mapper.toDomain(this.db.insert(appSettings).values({ id: 1 }).returning().get());
  }

  update(input: SettingsUpdate): Settings {
    const record = this.mapper.toRecord(input);
    return this.mapper.toDomain(
      this.db
        .insert(appSettings)
        .values({ id: 1, ...record })
        .onConflictDoUpdate({
          target: appSettings.id,
          set: record
        })
        .returning()
        .get()
    );
  }
}
