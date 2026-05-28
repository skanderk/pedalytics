import { z } from "zod";

export const settingsUpdateSchema = z.object({
  homeLocationId: z.number().int().positive().nullable().optional(),
  useMetricSystem: z.boolean().default(true)
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
