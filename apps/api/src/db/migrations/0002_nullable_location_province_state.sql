PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

CREATE TABLE locations_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province_state TEXT,
  country TEXT NOT NULL,
  zip_code TEXT,
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO locations_new (
  id,
  name,
  address,
  city,
  province_state,
  country,
  zip_code,
  latitude,
  longitude,
  created_at,
  updated_at
)
SELECT
  id,
  name,
  address,
  city,
  province_state,
  country,
  zip_code,
  latitude,
  longitude,
  created_at,
  updated_at
FROM locations;

DROP TABLE locations;

ALTER TABLE locations_new RENAME TO locations;

COMMIT;

PRAGMA foreign_keys = ON;
