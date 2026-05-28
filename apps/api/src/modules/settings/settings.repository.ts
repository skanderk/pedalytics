import { eq } from "drizzle-orm";
import type { PedalyticsDatabase } from "../../db/client.js";
import { appSettings, type AppSettingsRecord, type NewAppSettingsRecord } from "../../db/schema.js";

export class SettingsRepository {
  constructor(private readonly db: PedalyticsDatabase) {}

  get(): AppSettingsRecord {
    const settings = this.db.select().from(appSettings).where(eq(appSettings.id, 1)).get();
    if (settings) {
      return settings;
    }
    return this.db.insert(appSettings).values({ id: 1 }).returning().get();
  }

  update(input: NewAppSettingsRecord): AppSettingsRecord {
    return this.db
      .insert(appSettings)
      .values({ id: 1, ...input })
      .onConflictDoUpdate({
        target: appSettings.id,
        set: input
      })
      .returning()
      .get();
  }
}
