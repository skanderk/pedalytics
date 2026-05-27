import { z } from "zod";

export const settingsUpdateSchema = z.object({
  homeLocationId: z.number().int().positive().nullable().optional(),
  defaultCity: z.string().trim(),
  defaultProvinceState: z.string().trim(),
  defaultCountry: z.string().trim(),
  defaultZipCode: z.string().trim().nullable().optional(),
  defaultLatitude: z.number().finite().nullable().optional(),
  defaultLongitude: z.number().finite().nullable().optional(),
  distanceUnit: z.literal("km").default("km"),
  temperatureUnit: z.literal("celsius").default("celsius"),
  windSpeedUnit: z.literal("kmh").default("kmh")
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
