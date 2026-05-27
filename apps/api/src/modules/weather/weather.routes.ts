import type { FastifyInstance } from "fastify";
import { WeatherController } from "./weather.controller.js";
import { OpenMeteoWeatherProvider, WeatherService } from "./weather.service.js";

export async function registerWeatherRoutes(app: FastifyInstance) {
  const service = new WeatherService(new OpenMeteoWeatherProvider());
  const controller = new WeatherController(service);
  app.post("/api/weather/preview", controller.preview);
}
