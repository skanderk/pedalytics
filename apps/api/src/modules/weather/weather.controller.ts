import type { FastifyRequest } from "fastify";
import { weatherPreviewSchema } from "./weather.schema.js";
import type { WeatherService } from "./weather.service.js";

export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  preview = async (request: FastifyRequest) => {
    const input = weatherPreviewSchema.parse(request.body);
    return this.weather.preview(input);
  };
}
