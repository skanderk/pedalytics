/**
 * Domain model for user settings.
 */
export class Settings {
  constructor(
    readonly homeLocationId: number | null,
    readonly useMetricSystem: boolean
  ) {}
}

export interface SettingsUpdate {
  homeLocationId?: number | null;
  useMetricSystem?: boolean;
}
