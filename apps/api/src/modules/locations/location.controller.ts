import type { FastifyReply, FastifyRequest } from "fastify";
import type { LocationDetails } from "./location.domain.js";
import { locationCreateSchema, locationIdParamsSchema, locationUpdateSchema } from "./location.schema.js";
import type { LocationCreateInput, LocationUpdateInput } from "./location.schema.js";
import type { LocationService } from "./location.service.js";

export class LocationController {
  constructor(private readonly locations: LocationService) {}

  list = async () => this.locations.listLocations();

  get = async (request: FastifyRequest) => {
    const { id } = locationIdParamsSchema.parse(request.params);
    return this.locations.getLocation(id);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = locationCreateSchema.parse(request.body);
    const location = this.locations.createLocation(this.toDomain(input));
    return reply.code(201).send(location);
  };

  update = async (request: FastifyRequest) => {
    const { id } = locationIdParamsSchema.parse(request.params);
    const input = locationUpdateSchema.parse(request.body);
    return this.locations.updateLocation(id, this.toDomain(input));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = locationIdParamsSchema.parse(request.params);
    this.locations.deleteLocation(id);
    return reply.code(204).send();
  };

  private toDomain(input: LocationCreateInput | LocationUpdateInput): LocationDetails {
    return {
      name: input.name,
      address: input.address,
      city: input.city,
      provinceState: input.provinceState,
      country: input.country,
      zipCode: input.zipCode,
      latitude: input.latitude,
      longitude: input.longitude
    };
  }
}
