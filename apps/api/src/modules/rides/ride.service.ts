import type { LocationRepository } from "../locations/location.repository.js";
import type { WeatherProvider } from "../weather/weather.service.js";
import type { DestinationVisit, Ride, RideDetails, RideDetailsWithWeather } from "./ride.domain.js";
import type { RideRepository } from "./ride.repository.js";
import type { RideListQuery } from "./ride.schema.js";

export interface PaginatedRides {
  items: Ride[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class RideService {
  constructor(
    private readonly rides: RideRepository,
    private readonly locations: LocationRepository,
    private readonly weather: WeatherProvider
  ) {}

  listRides({ page, pageSize }: RideListQuery): PaginatedRides {
    const total = this.rides.count();
    return {
      items: this.rides.listPage(page, pageSize),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  listDestinationVisits(): DestinationVisit[] {
    return this.rides.listDestinationVisits();
  }

  getRide(id: number): Ride {
    const ride = this.rides.findById(id);
    if (!ride) {
      throw new Error("RIDE_NOT_FOUND");
    }
    return ride;
  }

  async createRide(rideDetails: RideDetails): Promise<Ride> {
    this.assertDoesNotOverlap(rideDetails);
    return this.rides.create(await this.withWeatherSnapshot(rideDetails));
  }

  async updateRide(id: number, rideDetails: RideDetails): Promise<Ride> {
    if (!this.rides.findById(id)) {
      throw new Error("RIDE_NOT_FOUND");
    }

    this.assertDoesNotOverlap(rideDetails, id);
    const ride = this.rides.update(id, await this.withWeatherSnapshot(rideDetails));
    if (!ride) {
      throw new Error("RIDE_NOT_FOUND");
    }
    return ride;
  }

  async deleteRide(id: number): Promise<void> {
    if (!this.rides.delete(id)) {
      throw new Error("RIDE_NOT_FOUND");
    }
  }

  private assertDoesNotOverlap(rideDetails: RideDetails, currentRideId?: number) {
    if (!rideDetails.startedAt || !rideDetails.endedAt) {
      return;
    }

    const overlappingRide = this.rides
      .listByRideDate(rideDetails.rideDate)
      .find(
        (ride) =>
          ride.id !== currentRideId &&
          ride.startedAt != null &&
          ride.endedAt != null &&
          rideDetails.startedAt! < ride.endedAt &&
          ride.startedAt < rideDetails.endedAt!
      );

    if (overlappingRide) {
      throw new Error("RIDE_TIME_OVERLAP");
    }
  }

  private async withWeatherSnapshot(rideDetails: RideDetails): Promise<RideDetailsWithWeather> {
    const departureLocation = rideDetails.departureLocationId ? this.locations.findById(rideDetails.departureLocationId) : undefined;
    if (departureLocation?.latitude == null || departureLocation.longitude == null) {
      return rideDetails;
    }

    const weather = await this.weather.getSnapshot({
      latitude: departureLocation.latitude,
      longitude: departureLocation.longitude,
      rideDate: rideDetails.rideDate
    });

    return {
      ...rideDetails,
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
