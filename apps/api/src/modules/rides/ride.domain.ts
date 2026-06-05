export interface RideDetails {
  rideDate: string;
  startedAt?: string | null;
  endedAt?: string | null;
  distanceKm: number;
  maxSpeedKmh?: number | null;
  averageSpeedKmh?: number | null;
  departureLocationId?: number | null;
  destinationLocationId?: number | null;
  notes?: string | null;
}

export interface RideWeatherDetails {
  weatherTemperatureCelsius: number | null;
  weatherFeelsLikeCelsius: number | null;
  weatherPrecipitationMm: number | null;
  weatherRainMm: number | null;
  weatherWindSpeedKmh: number | null;
  weatherWindDirectionDegrees: number | null;
  weatherWindDirectionCardinal: string | null;
  weatherCode: number | null;
  weatherFetchedAt: string | null;
}

export type RideDetailsWithWeather = RideDetails & Partial<RideWeatherDetails>;

export interface RideFields {
  id: number;
  rideDate: string;
  startedAt: string | null;
  endedAt: string | null;
  distanceKm: number;
  maxSpeedKmh: number | null;
  averageSpeedKmh: number | null;
  departureLocationId: number | null;
  destinationLocationId: number | null;
  notes: string | null;
  weatherTemperatureCelsius: number | null;
  weatherFeelsLikeCelsius: number | null;
  weatherPrecipitationMm: number | null;
  weatherRainMm: number | null;
  weatherWindSpeedKmh: number | null;
  weatherWindDirectionDegrees: number | null;
  weatherWindDirectionCardinal: string | null;
  weatherCode: number | null;
}

export class Ride implements RideFields {
  readonly id: number;
  readonly rideDate: string;
  readonly startedAt: string | null;
  readonly endedAt: string | null;
  readonly distanceKm: number;
  readonly maxSpeedKmh: number | null;
  readonly averageSpeedKmh: number | null;
  readonly departureLocationId: number | null;
  readonly destinationLocationId: number | null;
  readonly notes: string | null;
  readonly weatherTemperatureCelsius: number | null;
  readonly weatherFeelsLikeCelsius: number | null;
  readonly weatherPrecipitationMm: number | null;
  readonly weatherRainMm: number | null;
  readonly weatherWindSpeedKmh: number | null;
  readonly weatherWindDirectionDegrees: number | null;
  readonly weatherWindDirectionCardinal: string | null;
  readonly weatherCode: number | null;

  constructor(fields: RideFields) {
    this.id = fields.id;
    this.rideDate = fields.rideDate;
    this.startedAt = fields.startedAt;
    this.endedAt = fields.endedAt;
    this.distanceKm = fields.distanceKm;
    this.maxSpeedKmh = fields.maxSpeedKmh;
    this.averageSpeedKmh = fields.averageSpeedKmh;
    this.departureLocationId = fields.departureLocationId;
    this.destinationLocationId = fields.destinationLocationId;
    this.notes = fields.notes;
    this.weatherTemperatureCelsius = fields.weatherTemperatureCelsius;
    this.weatherFeelsLikeCelsius = fields.weatherFeelsLikeCelsius;
    this.weatherPrecipitationMm = fields.weatherPrecipitationMm;
    this.weatherRainMm = fields.weatherRainMm;
    this.weatherWindSpeedKmh = fields.weatherWindSpeedKmh;
    this.weatherWindDirectionDegrees = fields.weatherWindDirectionDegrees;
    this.weatherWindDirectionCardinal = fields.weatherWindDirectionCardinal;
    this.weatherCode = fields.weatherCode;
  }
}
