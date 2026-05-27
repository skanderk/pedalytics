import { z } from "zod";

const nullableText = z.string().trim().min(1).nullable().optional();
const nullableCoordinate = z.number().finite().nullable().optional();

export const locationCreateSchema = z.object({
  name: z.string().trim().min(1),
  address: nullableText,
  city: z.string().trim().min(1),
  provinceState: nullableText,
  country: z.string().trim().min(1),
  zipCode: nullableText,
  latitude: nullableCoordinate,
  longitude: nullableCoordinate
});

export const locationUpdateSchema = locationCreateSchema;

export const locationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
