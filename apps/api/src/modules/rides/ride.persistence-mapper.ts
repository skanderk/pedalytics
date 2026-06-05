import type { NewRideRecord, RideRecord } from "../../db/schema.js";
import { Ride, type RideDetailsWithWeather } from "./ride.domain.js";

export class RidePersistenceMapper {
  toDomain(record: RideRecord): Ride {
    return new Ride({
      id: record.id,
      rideDate: record.rideDate,
      startedAt: record.startedAt,
      endedAt: record.endedAt,
      distanceKm: record.distanceKm,
      maxSpeedKmh: record.maxSpeedKmh,
      averageSpeedKmh: record.averageSpeedKmh,
      departureLocationId: record.departureLocationId,
      destinationLocationId: record.destinationLocationId,
      notes: record.notes,
      weatherTemperatureCelsius: record.weatherTemperatureCelsius,
      weatherFeelsLikeCelsius: record.weatherFeelsLikeCelsius,
      weatherPrecipitationMm: record.weatherPrecipitationMm,
      weatherRainMm: record.weatherRainMm,
      weatherWindSpeedKmh: record.weatherWindSpeedKmh,
      weatherWindDirectionDegrees: record.weatherWindDirectionDegrees,
      weatherWindDirectionCardinal: record.weatherWindDirectionCardinal,
      weatherCode: record.weatherCode
    });
  }

  toRecord(input: RideDetailsWithWeather): NewRideRecord {
    const record: NewRideRecord = {
      rideDate: input.rideDate,
      distanceKm: input.distanceKm
    };

    if (input.startedAt !== undefined) record.startedAt = input.startedAt;
    if (input.endedAt !== undefined) record.endedAt = input.endedAt;
    if (input.maxSpeedKmh !== undefined) record.maxSpeedKmh = input.maxSpeedKmh;
    if (input.averageSpeedKmh !== undefined) record.averageSpeedKmh = input.averageSpeedKmh;
    if (input.departureLocationId !== undefined) record.departureLocationId = input.departureLocationId;
    if (input.destinationLocationId !== undefined) record.destinationLocationId = input.destinationLocationId;
    if (input.notes !== undefined) record.notes = input.notes;
    if (input.weatherTemperatureCelsius !== undefined) record.weatherTemperatureCelsius = input.weatherTemperatureCelsius;
    if (input.weatherFeelsLikeCelsius !== undefined) record.weatherFeelsLikeCelsius = input.weatherFeelsLikeCelsius;
    if (input.weatherPrecipitationMm !== undefined) record.weatherPrecipitationMm = input.weatherPrecipitationMm;
    if (input.weatherRainMm !== undefined) record.weatherRainMm = input.weatherRainMm;
    if (input.weatherWindSpeedKmh !== undefined) record.weatherWindSpeedKmh = input.weatherWindSpeedKmh;
    if (input.weatherWindDirectionDegrees !== undefined) record.weatherWindDirectionDegrees = input.weatherWindDirectionDegrees;
    if (input.weatherWindDirectionCardinal !== undefined) record.weatherWindDirectionCardinal = input.weatherWindDirectionCardinal;
    if (input.weatherCode !== undefined) record.weatherCode = input.weatherCode;
    if (input.weatherFetchedAt !== undefined) record.weatherFetchedAt = input.weatherFetchedAt;

    return record;
  }
}
