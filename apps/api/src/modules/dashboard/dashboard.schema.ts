import { z } from "zod";

export const dashboardDailyQuerySchema = z.object({
  year: z.coerce.number().int().min(1940).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export const dashboardMonthlyQuerySchema = z.object({
  year: z.coerce.number().int().min(1940).max(2100)
});

export type DashboardDailyQuery = z.infer<typeof dashboardDailyQuerySchema>;
export type DashboardMonthlyQuery = z.infer<typeof dashboardMonthlyQuerySchema>;
