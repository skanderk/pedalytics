import type { FastifyInstance } from "fastify";
import { LocationPersistenceMapper } from "../locations/location.persistence-mapper.js";
import { LocationRepository } from "../locations/location.repository.js";
import { OpenMeteoWeatherProvider } from "../weather/weather.service.js";
import { RideController } from "./ride.controller.js";
import { RidePersistenceMapper } from "./ride.persistence-mapper.js";
import { RideRepository } from "./ride.repository.js";
import { RideService } from "./ride.service.js";

export async function registerRideRoutes(app: FastifyInstance): Promise<void> {
  const rideMapper = new RidePersistenceMapper();
  const repository = new RideRepository(app.db, rideMapper);
  const locationMapper = new LocationPersistenceMapper();
  const locationRepository = new LocationRepository(app.db, locationMapper);
  const weatherProvider = app.weatherProvider ?? new OpenMeteoWeatherProvider();
  const service = new RideService(repository, locationRepository, weatherProvider);
  const controller = new RideController(service);

  app.get("/api/rides", controller.list);
  app.get("/api/rides/:id", controller.get);
  app.post("/api/rides", controller.create);
  app.put("/api/rides/:id", controller.update);
  app.delete("/api/rides/:id", controller.delete);
}
