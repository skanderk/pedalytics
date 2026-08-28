export function heatmapIntensity(visitCount: number, maxVisitCount: number): number {
  if (!Number.isFinite(visitCount) || !Number.isFinite(maxVisitCount) || visitCount <= 0 || maxVisitCount <= 0) return 0;
  return Math.min(visitCount / maxVisitCount, 1);
}
