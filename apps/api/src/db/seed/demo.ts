import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { FastifyInstance } from "fastify";
import { createDatabaseConnection } from "../client.js";
import { runMigrations } from "../migrate.js";
import { buildApp } from "../../app.js";
import type { Location } from "../../modules/locations/location.domain.js";
import type { Ride } from "../../modules/rides/ride.domain.js";
import type { WeatherPreviewInput, WeatherSnapshot } from "../../modules/weather/weather.schema.js";
import { type WeatherProvider, windDirectionToCardinal } from "../../modules/weather/weather.service.js";

const defaultDemoDatabasePath = resolve(process.cwd(), "data", "pedalytics.demo.db");
const realDatabaseFileName = "pedalytics.db";
export const demoRideCount = 500;
const fromYear = 2021;
const toYear = 2026;
export const demoEndDate = "2026-06-04";

interface DemoLocationInput {
  name: string;
  address?: string;
  city: string;
  provinceState: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
}

interface GeneratedRideInput {
  rideDate: string;
  startedAt: string;
  endedAt: string;
  distanceKm: number;
  maxSpeedKmh: number;
  averageSpeedKmh: number;
  departureLocationId: number;
  destinationLocationId: number;
  notes: string;
}

export class SeededRandom {
  constructor(private seed: number) {}

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  integer(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(items: T[]) {
    return items[this.integer(0, items.length - 1)]!;
  }
}

class YearlyHistoricalWeatherProvider implements WeatherProvider {
  private readonly cache = new Map<string, Promise<Map<string, WeatherSnapshot>>>();

  async getSnapshot(input: WeatherPreviewInput) {
    const year = input.rideDate.slice(0, 4);
    const key = [year, input.latitude.toFixed(4), input.longitude.toFixed(4)].join(":");

    let yearlySnapshots = this.cache.get(key);
    if (!yearlySnapshots) {
      yearlySnapshots = this.fetchYear(input, year);
      this.cache.set(key, yearlySnapshots);
    }

    const snapshot = (await yearlySnapshots).get(input.rideDate);
    if (!snapshot) {
      throw new Error(`WEATHER_SNAPSHOT_NOT_FOUND:${input.rideDate}`);
    }

    return snapshot;
  }

  private async fetchYear(input: WeatherPreviewInput, year: string) {
    const endDate = year === demoEndDate.slice(0, 4) ? demoEndDate : `${year}-12-31`;
    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", String(input.latitude));
    url.searchParams.set("longitude", String(input.longitude));
    url.searchParams.set("start_date", `${year}-01-01`);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("daily", "weather_code,temperature_2m_mean,apparent_temperature_mean,precipitation_sum,rain_sum,wind_speed_10m_max,wind_direction_10m_dominant");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("wind_speed_unit", "kmh");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WEATHER_FETCH_FAILED:${response.status}`);
    }

    const payload = (await response.json()) as {
      daily?: {
        time?: string[];
        weather_code?: Array<number | null>;
        temperature_2m_mean?: Array<number | null>;
        apparent_temperature_mean?: Array<number | null>;
        precipitation_sum?: Array<number | null>;
        rain_sum?: Array<number | null>;
        wind_speed_10m_max?: Array<number | null>;
        wind_direction_10m_dominant?: Array<number | null>;
      };
    };

    const snapshots = new Map<string, WeatherSnapshot>();
    const fetchedAt = `${endDate}T00:00:00.000Z`;
    for (const [index, date] of payload.daily?.time?.entries() ?? []) {
      const windDirectionDegrees = payload.daily?.wind_direction_10m_dominant?.[index] ?? null;
      snapshots.set(date, {
        temperatureCelsius: payload.daily?.temperature_2m_mean?.[index] ?? null,
        feelsLikeCelsius: payload.daily?.apparent_temperature_mean?.[index] ?? null,
        precipitationMm: payload.daily?.precipitation_sum?.[index] ?? null,
        rainMm: payload.daily?.rain_sum?.[index] ?? null,
        windSpeedKmh: payload.daily?.wind_speed_10m_max?.[index] ?? null,
        windDirectionDegrees,
        windDirectionCardinal: windDirectionToCardinal(windDirectionDegrees),
        weatherCode: payload.daily?.weather_code?.[index] ?? null,
        fetchedAt
      });
    }

    return snapshots;
  }
}

const homeLocation: DemoLocationInput = {
  name: "Home",
  address: "4043 Rue Saint-Denis",
  city: "Montreal",
  provinceState: "QC",
  country: "Canada",
  zipCode: "H2W 2M7",
  latitude: 45.52068,
  longitude: -73.58071
};

const destinationLocations: DemoLocationInput[] = [
  {
    name: "Parc du Mont-Royal",
    address: "1260 Chemin Remembrance",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H3H 1A2",
    latitude: 45.501553,
    longitude: -73.593338
  },
  {
    name: "Parc Jean-Drapeau",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    latitude: 45.508373,
    longitude: -73.53292
  },
  {
    name: "Parc Maisonneuve",
    address: "4601 Rue Sherbrooke Est",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H1X 2B1",
    latitude: 45.56213,
    longitude: -73.55557
  },
  {
    name: "Parc Angrignon",
    address: "3400 Boulevard Trinitarian",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H4E 4J3",
    latitude: 45.44616,
    longitude: -73.60322
  },
  {
    name: "Parc-nature du Bois-de-Liesse",
    address: "3555 Rue Douglas-B.-Floreani",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H4S 1Y6",
    latitude: 45.48974,
    longitude: -73.75041
  },
  {
    name: "Parc-nature de l'Ile-de-la-Visitation",
    address: "2425 Boulevard Gouin Est",
    city: "Montreal",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H2B 1X7",
    latitude: 45.57943,
    longitude: -73.65354
  },
  {
    name: "Parc Bernard-Landry",
    address: "5 Avenue du Crochet",
    city: "Laval",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H7N 2T8",
    latitude: 45.56129,
    longitude: -73.6987
  },
  {
    name: "Parc de la Riviere-des-Mille-Iles",
    address: "345 Boulevard Sainte-Rose",
    city: "Laval",
    provinceState: "QC",
    country: "Canada",
    zipCode: "H7L 1M7",
    latitude: 45.60981,
    longitude: -73.78264
  },
  {
    name: "Parc Michel-Chartrand",
    address: "1895 Rue Adoncour",
    city: "Longueuil",
    provinceState: "QC",
    country: "Canada",
    zipCode: "J4J 5G8",
    latitude: 45.54343,
    longitude: -73.4714
  },
  {
    name: "Parc national des Iles-de-Boucherville",
    city: "Boucherville",
    provinceState: "QC",
    country: "Canada",
    latitude: 45.616666,
    longitude: -73.466666
  }
];

function parseArguments() {
  const databaseArgIndex = process.argv.indexOf("--database");
  const databasePath =
    databaseArgIndex >= 0 && process.argv[databaseArgIndex + 1]
      ? resolve(process.argv[databaseArgIndex + 1]!)
      : defaultDemoDatabasePath;

  return { databasePath };
}

export function assertSafeDemoDatabasePath(databasePath: string) {
  const resolvedPath = resolve(databasePath);
  const normalizedPath = resolvedPath.replaceAll("\\", "/").toLowerCase();

  if (normalizedPath.endsWith(`/data/${realDatabaseFileName}`) || normalizedPath.endsWith(`/${realDatabaseFileName}`)) {
    throw new Error(`Refusing to overwrite the real database at ${resolvedPath}`);
  }

  if (!normalizedPath.includes("demo") && !normalizedPath.includes("test")) {
    throw new Error(`Refusing to rebuild a database path that is not clearly demo/test: ${resolvedPath}`);
  }
}

function resetDemoDatabase(databasePath: string) {
  assertSafeDemoDatabasePath(databasePath);

  const { sqlite } = createDatabaseConnection(databasePath);
  sqlite.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS rides;
    DROP TABLE IF EXISTS app_settings;
    DROP TABLE IF EXISTS locations;
    DROP TABLE IF EXISTS schema_migrations;
    DROP INDEX IF EXISTS idx_rides_ride_date;
    PRAGMA foreign_keys = ON;
  `);
  sqlite.close();

  runMigrations(databasePath);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysInYear(year: number) {
  return Math.round((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000);
}

function dateFromDayOfYear(year: number, dayOfYear: number) {
  return new Date(Date.UTC(year, 0, dayOfYear));
}

function isWithinDemoRange(date: Date) {
  return toDateKey(date) <= demoEndDate;
}

function dayOfYear(date: Date) {
  return Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86_400_000) + 1;
}

function seasonalWeight(date: Date) {
  const peak = 196;
  const spread = 58;
  const gaussian = Math.exp(-0.5 * ((dayOfYear(date) - peak) / spread) ** 2);
  const month = date.getUTCMonth();
  const weekendBoost = date.getUTCDay() === 0 || date.getUTCDay() === 6 ? 1.25 : 1;
  const winterFloor = month <= 2 || month === 11 ? 0.005 : 0;

  return (gaussian + winterFloor) * weekendBoost;
}

function weightedSample<T>(rng: SeededRandom, items: Array<{ item: T; weight: number }>) {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = rng.next() * total;

  for (const entry of items) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1]!.item;
}

export function generateRideDates(rng: SeededRandom, count = demoRideCount) {
  const weightedDates: Array<{ item: string; weight: number }> = [];
  for (let year = fromYear; year <= toYear; year += 1) {
    for (let day = 1; day <= daysInYear(year); day += 1) {
      const date = dateFromDayOfYear(year, day);
      if (!isWithinDemoRange(date)) {
        continue;
      }
      weightedDates.push({ item: toDateKey(date), weight: seasonalWeight(date) });
    }
  }

  const dates = new Set<string>();
  while (dates.size < count) {
    dates.add(weightedSample(rng, weightedDates));
  }

  return [...dates].sort();
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(from: DemoLocationInput, to: DemoLocationInput) {
  const earthRadiusKm = 6371;
  const deltaLatitude = degreesToRadians(to.latitude - from.latitude);
  const deltaLongitude = degreesToRadians(to.longitude - from.longitude);
  const latitude1 = degreesToRadians(from.latitude);
  const latitude2 = degreesToRadians(to.latitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour! * 60 + minute! + minutes;
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function generateStartTime(rng: SeededRandom, rideDate: string) {
  const date = new Date(`${rideDate}T00:00:00.000Z`);
  const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const baseHour = isWeekend ? rng.choice([7, 8, 9, 10, 13]) : rng.choice([6, 7, 17, 18]);
  const minute = rng.choice([0, 5, 10, 15, 20, 30, 40, 45, 50]);

  return `${String(baseHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildRide(
  rng: SeededRandom,
  rideDate: string,
  home: Location,
  destinations: Location[]
): GeneratedRideInput {
  const destination = rng.choice(destinations);
  const destinationInput = destinationLocations.find((location) => location.name === destination.name)!;
  const directDistanceKm = haversineDistanceKm(homeLocation, destinationInput);
  const scenicMultiplier = 1.25 + rng.next() * 1.05;
  const detourKm = rng.next() < 0.24 ? rng.integer(4, 24) : 0;
  const distanceKm = round(Math.max(5, directDistanceKm * scenicMultiplier + detourKm), 1);
  const averageSpeedKmh = round(17 + rng.next() * 10, 1);
  const durationMinutes = Math.max(20, Math.round((distanceKm / averageSpeedKmh) * 60));
  const startedAt = generateStartTime(rng, rideDate);

  return {
    rideDate,
    startedAt,
    endedAt: addMinutes(startedAt, durationMinutes),
    distanceKm,
    averageSpeedKmh,
    maxSpeedKmh: round(averageSpeedKmh + 8 + rng.next() * 14, 1),
    departureLocationId: home.id,
    destinationLocationId: destination.id,
    notes: rng.choice([
      "Steady spin from home.",
      "Took the scenic path where it made sense.",
      "Comfortable endurance pace.",
      "A little extra distance before heading back.",
      "Clear legs and an easy rhythm."
    ])
  };
}

async function injectJson<T>(app: FastifyInstance, method: "POST" | "PUT", url: string, payload: object) {
  const response = await app.inject({ method, url, payload });
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`${method} ${url} failed with ${response.statusCode}: ${response.body}`);
  }

  return response.json<T>();
}

async function populateDemoDatabase(databasePath: string) {
  resetDemoDatabase(databasePath);
  process.env.DATABASE_URL = databasePath;

  const app = await buildApp({ logger: false, weatherProvider: new YearlyHistoricalWeatherProvider() });
  try {
    const home = await injectJson<Location>(app, "POST", "/api/locations", homeLocation);
    const destinations: Location[] = [];

    for (const destination of destinationLocations) {
      destinations.push(await injectJson<Location>(app, "POST", "/api/locations", destination));
    }

    await injectJson(app, "PUT", "/api/settings", {
      homeLocationId: home.id,
      useMetricSystem: true
    });

    const rng = new SeededRandom(0x507eda1);
    const rideDates = generateRideDates(rng);
    for (const rideDate of rideDates) {
      await injectJson<Ride>(app, "POST", "/api/rides", buildRide(rng, rideDate, home, destinations));
    }
  } finally {
    await app.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { databasePath } = parseArguments();
  await populateDemoDatabase(databasePath);
  const relativePath = existsSync(databasePath) ? databasePath.replace(`${dirname(process.cwd())}/`, "") : databasePath;
  console.log(`Demo database populated at ${relativePath}`);
}
