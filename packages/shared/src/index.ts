export const supportedDistanceUnits = ["km"] as const;
export const supportedTemperatureUnits = ["celsius"] as const;
export const supportedWindSpeedUnits = ["kmh"] as const;

export type DistanceUnit = (typeof supportedDistanceUnits)[number];
export type TemperatureUnit = (typeof supportedTemperatureUnits)[number];
export type WindSpeedUnit = (typeof supportedWindSpeedUnits)[number];
