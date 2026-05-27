import { runMigrations } from "./db/migrate.js";
import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 3333);

runMigrations();
const app = await buildApp();

await app.listen({ port, host: "0.0.0.0" });
