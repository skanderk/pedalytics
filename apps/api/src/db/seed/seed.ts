import { runMigrations } from "../migrate.js";
import { createDatabaseConnection } from "../client.js";
import { appSettings, locations, rides } from "../schema.js";

runMigrations();

const { db, sqlite } = createDatabaseConnection();

sqlite.exec(`
  DELETE FROM rides;
  DELETE FROM app_settings;
  DELETE FROM locations;
  DELETE FROM sqlite_sequence WHERE name IN ('rides', 'locations');
`);

const home = db
  .insert(locations)
  .values({
    name: "Home",
    address: "Manual sample",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H2X",
    latitude: 45.5019,
    longitude: -73.5674
  })
  .returning()
  .get();

const park = db
  .insert(locations)
  .values({
    name: "Parc Jean-Drapeau",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    latitude: 45.514,
    longitude: -73.533
  })
  .returning()
  .get();

const canal = db
  .insert(locations)
  .values({
    name: "Lachine Canal",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    latitude: 45.477,
    longitude: -73.574
  })
  .returning()
  .get();

db.insert(appSettings)
  .values({
    id: 1,
    homeLocationId: home.id,
    useMetricSystem: true
  })
  .onConflictDoUpdate({
    target: appSettings.id,
    set: {
      homeLocationId: home.id,
      useMetricSystem: true
    }
  })
  .run();

db.insert(rides)
  .values([
    {
      rideDate: "2026-04-18",
      startedAt: "09:30",
      endedAt: "10:45",
      distanceKm: 22.4,
      departureLocationId: home.id,
      destinationLocationId: park.id,
      notes: "Easy spring loop."
    },
    {
      rideDate: "2026-04-22",
      startedAt: "17:10",
      endedAt: "18:20",
      distanceKm: 18.8,
      departureLocationId: home.id,
      destinationLocationId: canal.id,
      notes: "Wind picked up near the water."
    },
    {
      rideDate: "2026-05-04",
      distanceKm: 31.2,
      departureLocationId: home.id,
      destinationLocationId: park.id
    }
  ])
  .run();

sqlite.close();
console.log("Seed data inserted.");
