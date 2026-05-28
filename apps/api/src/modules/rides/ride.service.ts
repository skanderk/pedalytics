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
    this.assertDoesNotOverlap(input);
    return this.rides.create(await this.withWeatherSnapshot(input));
  }

  async updateRide(id: number, input: RideUpdateInput) {
    if (!this.rides.findById(id)) {
      throw new Error("RIDE_NOT_FOUND");
    }
    this.assertDoesNotOverlap(input, id);
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

  private assertDoesNotOverlap(input: RideCreateInput | RideUpdateInput, currentRideId?: number) {
    if (!input.startedAt || !input.endedAt) {
      return;
    }

    const overlappingRide = this.rides
      .listByRideDate(input.rideDate)
      .find(
        (ride) =>
          ride.id !== currentRideId &&
          ride.startedAt != null &&
          ride.endedAt != null &&
          input.startedAt! < ride.endedAt &&
          ride.startedAt < input.endedAt!
      );

    if (overlappingRide) {
      throw new Error("RIDE_TIME_OVERLAP");
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
