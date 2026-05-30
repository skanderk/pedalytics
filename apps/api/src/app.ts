import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { createDatabaseConnection, type PedalyticsDatabase } from "./db/client.js";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { registerLocationRoutes } from "./modules/locations/location.routes.js";
import { registerRideRoutes } from "./modules/rides/ride.routes.js";
import { registerSettingsRoutes } from "./modules/settings/settings.routes.js";
import { registerWeatherRoutes } from "./modules/weather/weather.routes.js";

declare module "fastify" {
  interface FastifyInstance {
    db: PedalyticsDatabase;
  }
}

function hasClientErrorStatus(error: unknown): error is { message: string; statusCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "statusCode" in error &&
    typeof error.message === "string" &&
    typeof error.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  );
}

/**
 * Creates a Fastify aplication. Configures the database connection, registers routes and error handlers.
 * @returns A promise resolving to the configured Fastify instance.
 */
export async function buildApp() {
  const app = Fastify({ logger: true });
  const { db, sqlite } = createDatabaseConnection();

  app.decorate("db", db);
  app.addHook("onClose", async () => sqlite.close());
  await app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Validation failed",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    if (error instanceof Error && error.message.endsWith("_NOT_FOUND")) {
      return reply.code(404).send({ message: error.message });
    }

    if (error instanceof Error && error.message === "RIDE_TIME_OVERLAP") {
      return reply.code(409).send({ message: error.message });
    }

    if (hasClientErrorStatus(error)) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    app.log.error(error);

    // Default to 500 Internal Server Error for unhandled cases.
    return reply.code(500).send({ message: "Internal server error" });
  });

  app.get("/api/health", async () => ({ ok: true }));
  await app.register(registerLocationRoutes);
  await app.register(registerSettingsRoutes);
  await app.register(registerRideRoutes);
  await app.register(registerDashboardRoutes);
  await app.register(registerWeatherRoutes);

  return app;
}
