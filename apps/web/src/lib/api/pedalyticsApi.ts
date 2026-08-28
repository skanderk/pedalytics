import { apiRequest } from "./apiClient";

export interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string;
  provinceState: string | null;
  country: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Ride {
  id: number;
  rideDate: string;
  startedAt: string | null;
  endedAt: string | null;
  distanceKm: number;
  maxSpeedKmh: number | null;
  averageSpeedKmh: number | null;
  departureLocationId: number | null;
  destinationLocationId: number | null;
  notes: string | null;
  weatherTemperatureCelsius: number | null;
  weatherFeelsLikeCelsius: number | null;
  weatherPrecipitationMm: number | null;
  weatherRainMm: number | null;
  weatherWindDirectionCardinal: string | null;
  weatherWindSpeedKmh: number | null;
  weatherWindDirectionDegrees: number | null;
  weatherCode: number | null;
}

export interface PaginatedRides {
  items: Ride[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DestinationVisit {
  locationId: number;
  name: string;
  latitude: number;
  longitude: number;
  visitCount: number;
}

export interface DashboardSummary {
  totalDistanceKm: number;
  rideCount: number;
  averageDistanceKm: number;
  longestRideKm: number;
  averageSpeedKmh: number | null;
  maxSpeedKmh: number | null;
}

export interface DashboardBucket extends DashboardSummary {}

export interface DashboardDailyStats extends DashboardSummary {
  dayMetrics: Array<DashboardBucket & { rideDate: string }>;
}

export interface DashboardMonthlyStats extends DashboardSummary {
  monthMetrics: Array<DashboardBucket & { month: number }>;
}

export interface DashboardYearlyStats extends DashboardSummary {
  yearMetrics: Array<DashboardBucket & { year: number }>;
}

export interface AppSettings {
  homeLocationId: number | null;
  useMetricSystem: boolean;
}

export type RideInput = Omit<
  Ride,
  | "id"
  | "weatherTemperatureCelsius"
  | "weatherFeelsLikeCelsius"
  | "weatherPrecipitationMm"
  | "weatherRainMm"
  | "weatherWindDirectionCardinal"
  | "weatherWindSpeedKmh"
  | "weatherWindDirectionDegrees"
  | "weatherCode"
>;
export type LocationInput = Omit<Location, "id">;
export type SettingsInput = AppSettings;

export const pedalyticsApi = {
  getDailyDashboard: (year: number, month: number) => {
    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("month", String(month));
    return apiRequest<DashboardDailyStats>(`/api/dashboard/daily?${params}`);
  },
  getMonthlyDashboard: (year: number) => {
    const params = new URLSearchParams();
    params.set("year", String(year));
    return apiRequest<DashboardMonthlyStats>(`/api/dashboard/monthly?${params}`);
  },
  getYearlyDashboard: () => apiRequest<DashboardYearlyStats>("/api/dashboard/yearly"),
  listRides: (page = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return apiRequest<PaginatedRides>(`/api/rides?${params}`);
  },
  getRideHeatmap: () => apiRequest<DestinationVisit[]>("/api/rides/heatmap"),
  createRide: (input: RideInput) => apiRequest<Ride>("/api/rides", { method: "POST", body: JSON.stringify(input) }),
  updateRide: (id: number, input: RideInput) => apiRequest<Ride>(`/api/rides/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteRide: (id: number) => apiRequest<void>(`/api/rides/${id}`, { method: "DELETE" }),
  listLocations: () => apiRequest<Location[]>("/api/locations"),
  createLocation: (input: LocationInput) => apiRequest<Location>("/api/locations", { method: "POST", body: JSON.stringify(input) }),
  updateLocation: (id: number, input: LocationInput) => apiRequest<Location>(`/api/locations/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteLocation: (id: number) => apiRequest<void>(`/api/locations/${id}`, { method: "DELETE" }),
  getSettings: () => apiRequest<AppSettings>("/api/settings"),
  updateSettings: (input: SettingsInput) => apiRequest<AppSettings>("/api/settings", { method: "PUT", body: JSON.stringify(input) })
};
