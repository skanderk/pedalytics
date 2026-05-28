import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  provinceState: text("province_state"),
  country: text("country").notNull(),
  zipCode: text("zip_code"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const rides = sqliteTable("rides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rideDate: text("ride_date").notNull(),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  distanceKm: real("distance_km").notNull(),
  maxSpeedKmh: real("max_speed_kmh"),
  averageSpeedKmh: real("average_speed_kmh"),
  departureLocationId: integer("departure_location_id").references(() => locations.id, { onDelete: "set null" }),
  destinationLocationId: integer("destination_location_id").references(() => locations.id, { onDelete: "set null" }),
  notes: text("notes"),
  weatherTemperatureCelsius: real("weather_temperature_celsius"),
  weatherFeelsLikeCelsius: real("weather_feels_like_celsius"),
  weatherPrecipitationMm: real("weather_precipitation_mm"),
  weatherRainMm: real("weather_rain_mm"),
  weatherWindSpeedKmh: real("weather_wind_speed_kmh"),
  weatherWindDirectionDegrees: integer("weather_wind_direction_degrees"),
  weatherWindDirectionCardinal: text("weather_wind_direction_cardinal"),
  weatherCode: integer("weather_code"),
  weatherFetchedAt: text("weather_fetched_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  homeLocationId: integer("home_location_id").references(() => locations.id, { onDelete: "set null" }),
  defaultCity: text("default_city").notNull().default(""),
  defaultProvinceState: text("default_province_state").notNull().default(""),
  defaultCountry: text("default_country").notNull().default(""),
  defaultZipCode: text("default_zip_code"),
  defaultLatitude: real("default_latitude"),
  defaultLongitude: real("default_longitude"),
  distanceUnit: text("distance_unit").notNull().default("km"),
  temperatureUnit: text("temperature_unit").notNull().default("celsius"),
  windSpeedUnit: text("wind_speed_unit").notNull().default("kmh"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const rideRelations = relations(rides, ({ one }) => ({
  departureLocation: one(locations, {
    fields: [rides.departureLocationId],
    references: [locations.id]
  }),
  destinationLocation: one(locations, {
    fields: [rides.destinationLocationId],
    references: [locations.id]
  })
}));

export type LocationRecord = typeof locations.$inferSelect;
export type NewLocationRecord = typeof locations.$inferInsert;
export type RideRecord = typeof rides.$inferSelect;
export type NewRideRecord = typeof rides.$inferInsert;
export type AppSettingsRecord = typeof appSettings.$inferSelect;
export type NewAppSettingsRecord = typeof appSettings.$inferInsert;
