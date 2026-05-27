import type { FastifyReply, FastifyRequest } from "fastify";
import { rideCreateSchema, rideIdParamsSchema, rideUpdateSchema } from "./ride.schema.js";
import type { RideService } from "./ride.service.js";

export class RideController {
  constructor(private readonly rides: RideService) {}

  list = async () => this.rides.listRides();

  get = async (request: FastifyRequest) => {
    const { id } = rideIdParamsSchema.parse(request.params);
    return this.rides.getRide(id);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = rideCreateSchema.parse(request.body);
    const ride = await this.rides.createRide(input);
    return reply.code(201).send(ride);
  };

  update = async (request: FastifyRequest) => {
    const { id } = rideIdParamsSchema.parse(request.params);
    const input = rideUpdateSchema.parse(request.body);
    return this.rides.updateRide(id, input);
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = rideIdParamsSchema.parse(request.params);
    this.rides.deleteRide(id);
    return reply.code(204).send();
  };
}
