import { z } from "zod";

const pastDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => value <= new Date().toISOString().slice(0, 10), {
  message: "Only past rides are supported"
});

const optionalTime = z.string().regex(/^\d{2}:\d{2}$/).nullable().optional();
const optionalId = z.number().int().positive().nullable().optional();
const optionalText = z.string().trim().nullable().optional();

export const rideCreateSchema = z.object({
  rideDate: pastDate,
  startedAt: optionalTime,
  endedAt: optionalTime,
  distanceKm: z.number().positive(),
  departureLocationId: optionalId,
  destinationLocationId: optionalId,
  notes: optionalText
});

export const rideUpdateSchema = rideCreateSchema;

export const rideIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type RideCreateInput = z.infer<typeof rideCreateSchema>;
export type RideUpdateInput = z.infer<typeof rideUpdateSchema>;
