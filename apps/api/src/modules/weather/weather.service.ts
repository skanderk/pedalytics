import type { WeatherPreviewInput, WeatherSnapshot } from "./weather.schema.js";

export interface WeatherProvider {
  getSnapshot(input: WeatherPreviewInput): Promise<WeatherSnapshot>;
}

export function windDirectionToCardinal(degrees: number | null | undefined): string | null {
  if (degrees === null || degrees === undefined) {
    return null;
  }

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((degrees % 360) + 360) % 360;
  return directions[Math.round(normalized / 45) % 8];
}

export class OpenMeteoWeatherProvider implements WeatherProvider {
  async getSnapshot(input: WeatherPreviewInput): Promise<WeatherSnapshot> {
    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", String(input.latitude));
    url.searchParams.set("longitude", String(input.longitude));
    url.searchParams.set("start_date", input.rideDate);
    url.searchParams.set("end_date", input.rideDate);
    url.searchParams.set("daily", "weather_code,temperature_2m_mean,apparent_temperature_mean,precipitation_sum,rain_sum,wind_speed_10m_max,wind_direction_10m_dominant");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("wind_speed_unit", "kmh");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("WEATHER_FETCH_FAILED");
    }

    const payload = (await response.json()) as {
      daily?: {
        weather_code?: Array<number | null>;
        temperature_2m_mean?: Array<number | null>;
        apparent_temperature_mean?: Array<number | null>;
        precipitation_sum?: Array<number | null>;
        rain_sum?: Array<number | null>;
        wind_speed_10m_max?: Array<number | null>;
        wind_direction_10m_dominant?: Array<number | null>;
      };
    };

    const windDirectionDegrees = payload.daily?.wind_direction_10m_dominant?.[0] ?? null;

    return {
      temperatureCelsius: payload.daily?.temperature_2m_mean?.[0] ?? null,
      feelsLikeCelsius: payload.daily?.apparent_temperature_mean?.[0] ?? null,
      precipitationMm: payload.daily?.precipitation_sum?.[0] ?? null,
      rainMm: payload.daily?.rain_sum?.[0] ?? null,
      windSpeedKmh: payload.daily?.wind_speed_10m_max?.[0] ?? null,
      windDirectionDegrees,
      windDirectionCardinal: windDirectionToCardinal(windDirectionDegrees),
      weatherCode: payload.daily?.weather_code?.[0] ?? null,
      fetchedAt: new Date().toISOString()
    };
  }
}

export class WeatherService {
  constructor(private readonly provider: WeatherProvider) {}

  preview(input: WeatherPreviewInput) {
    return this.provider.getSnapshot(input);
  }
}
