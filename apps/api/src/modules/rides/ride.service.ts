import type { LocationRepository } from "../locations/location.repository.js";
import type { WeatherProvider } from "../weather/weather.service.js";
import type { RideCreateInput, RideUpdateInput } from "./ride.schema.js";
import type { RideRepository } from "./ride.repository.js";

export class RideService {
  constructor(
    private readonly rides: RideRepository,
    private readonly locations: LocationRepository,
    private readonly weather: WeatherProvider
  ) {}

  listRides() {
    return this.rides.list();
  }

  getRide(id: number) {
    const ride = this.rides.findById(id);
    if (!ride) {
      throw new Error("RIDE_NOT_FOUND");
    }
    return ride;
  }

  async createRide(input: RideCreateInput) {
    return this.rides.create(await this.withWeatherSnapshot(input));
  }

  async updateRide(id: number, input: RideUpdateInput) {
    const ride = this.rides.update(id, await this.withWeatherSnapshot(input));
    if (!ride) {
      throw new Error("RIDE_NOT_FOUND");
    }
    return ride;
  }

  deleteRide(id: number) {
    if (!this.rides.delete(id)) {
      throw new Error("RIDE_NOT_FOUND");
    }
  }

  private async withWeatherSnapshot(input: RideCreateInput | RideUpdateInput) {
    const departureLocation = input.departureLocationId ? this.locations.findById(input.departureLocationId) : undefined;
    if (departureLocation?.latitude == null || departureLocation.longitude == null) {
      return input;
    }

    const weather = await this.weather.getSnapshot({
      latitude: departureLocation.latitude,
      longitude: departureLocation.longitude,
      rideDate: input.rideDate
    });

    return {
      ...input,
      weatherTemperatureCelsius: weather.temperatureCelsius,
      weatherFeelsLikeCelsius: weather.feelsLikeCelsius,
      weatherPrecipitationMm: weather.precipitationMm,
      weatherRainMm: weather.rainMm,
      weatherWindSpeedKmh: weather.windSpeedKmh,
      weatherWindDirectionDegrees: weather.windDirectionDegrees,
      weatherWindDirectionCardinal: weather.windDirectionCardinal,
      weatherCode: weather.weatherCode,
      weatherFetchedAt: weather.fetchedAt
    };
  }
}
