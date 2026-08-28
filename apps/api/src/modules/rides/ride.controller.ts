import type { FastifyReply, FastifyRequest } from "fastify";
import type { RideDetails } from "./ride.domain.js";
import { rideCreateSchema, rideIdParamsSchema, rideListQuerySchema, rideUpdateSchema } from "./ride.schema.js";
import type { RideCreateInput, RideUpdateInput } from "./ride.schema.js";
import type { RideService } from "./ride.service.js";

export class RideController {
  constructor(private readonly rides: RideService) {}

  list = async (request: FastifyRequest) => {
    const query = rideListQuerySchema.parse(request.query);
    return this.rides.listRides(query);
  };

  heatmap = async () => this.rides.listDestinationVisits();

  get = async (request: FastifyRequest) => {
    const { id } = rideIdParamsSchema.parse(request.params);
    return this.rides.getRide(id);
  };

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const input = rideCreateSchema.parse(request.body);
    const ride = await this.rides.createRide(this.toDomain(input));
    return reply.code(201).send(ride);
  };

  update = async (request: FastifyRequest, reply: FastifyReply) =>  {
    const { id } = rideIdParamsSchema.parse(request.params);
    const input = rideUpdateSchema.parse(request.body);
    return this.rides.updateRide(id, this.toDomain(input));
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = rideIdParamsSchema.parse(request.params);
    this.rides.deleteRide(id);
    return reply.code(204).send();
  };

  private toDomain(input: RideCreateInput | RideUpdateInput): RideDetails {
    return {
      rideDate: input.rideDate,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      distanceKm: input.distanceKm,
      maxSpeedKmh: input.maxSpeedKmh,
      averageSpeedKmh: input.averageSpeedKmh,
      departureLocationId: input.departureLocationId,
      destinationLocationId: input.destinationLocationId,
      notes: input.notes
    };
  }
}
