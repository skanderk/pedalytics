CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province_state TEXT NOT NULL,
  country TEXT NOT NULL,
  zip_code TEXT,
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_date TEXT NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  distance_km REAL NOT NULL,
  departure_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  destination_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  notes TEXT,
  weather_temperature_celsius REAL,
  weather_feels_like_celsius REAL,
  weather_precipitation_mm REAL,
  weather_rain_mm REAL,
  weather_wind_speed_kmh REAL,
  weather_wind_direction_degrees INTEGER,
  weather_wind_direction_cardinal TEXT,
  weather_code INTEGER,
  weather_fetched_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  home_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  default_city TEXT NOT NULL DEFAULT '',
  default_province_state TEXT NOT NULL DEFAULT '',
  default_country TEXT NOT NULL DEFAULT '',
  default_zip_code TEXT,
  default_latitude REAL,
  default_longitude REAL,
  distance_unit TEXT NOT NULL DEFAULT 'km',
  temperature_unit TEXT NOT NULL DEFAULT 'celsius',
  wind_speed_unit TEXT NOT NULL DEFAULT 'kmh',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO app_settings (id, distance_unit, temperature_unit, wind_speed_unit)
VALUES (1, 'km', 'celsius', 'kmh');
