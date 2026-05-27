import { z } from "zod";

export const weatherSnapshotSchema = z.object({
  temperatureCelsius: z.number().nullable(),
  feelsLikeCelsius: z.number().nullable(),
  precipitationMm: z.number().nullable(),
  rainMm: z.number().nullable(),
  windSpeedKmh: z.number().nullable(),
  windDirectionDegrees: z.number().int().min(0).max(360).nullable(),
  windDirectionCardinal: z.string().nullable(),
  weatherCode: z.number().int().nullable(),
  fetchedAt: z.string()
});

export const weatherPreviewSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export type WeatherSnapshot = z.infer<typeof weatherSnapshotSchema>;
export type WeatherPreviewInput = z.infer<typeof weatherPreviewSchema>;
