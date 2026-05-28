export function formatKilometers(value: number) {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)} km`;
}

export function formatOptionalKilometersPerHour(value: number | null | undefined) {
  return value == null ? "n/a" : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)} km/h`;
}
