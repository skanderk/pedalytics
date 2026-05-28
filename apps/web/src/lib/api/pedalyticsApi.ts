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
  weatherWindDirectionCardinal: string | null;
  weatherWindSpeedKmh: number | null;
}

export interface DashboardStats {
  totalDistanceKm: number;
  rideCount: number;
  averageDistanceKm: number;
  longestRideKm: number;
  distanceByDay: Array<{ rideDate: string; distanceKm: number }>;
}

export interface AppSettings {
  homeLocationId: number | null;
  useMetricSystem: boolean;
}

export type RideInput = Omit<Ride, "id" | "weatherWindDirectionCardinal" | "weatherWindSpeedKmh">;
export type LocationInput = Omit<Location, "id">;
export type SettingsInput = AppSettings;

export const pedalyticsApi = {
  getDashboard: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    return apiRequest<DashboardStats>(`/api/dashboard?${params}`);
  },
  listRides: () => apiRequest<Ride[]>("/api/rides"),
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
