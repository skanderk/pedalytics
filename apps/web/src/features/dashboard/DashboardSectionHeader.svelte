<script lang="ts">
  import { formatKilometers } from "../../lib/formatting/distance";

  interface DashboardSectionStats {
    totalDistanceKm: number;
    rideCount: number;
    averageDistanceKm: number;
    longestRideKm: number;
    averageSpeedKmh: number | null;
  }

  let {
    stats,
    subtitle,
    title
  }: {
    stats: DashboardSectionStats;
    subtitle?: string;
    title: string;
  } = $props();

  const statCards = $derived([
    { label: "Total distance", value: formatKilometers(stats.totalDistanceKm) },
    { label: "Rides", value: String(stats.rideCount) },
    { label: "Average ride", value: formatKilometers(stats.averageDistanceKm) },
    { label: "Longest ride", value: formatKilometers(stats.longestRideKm) },
    { label: "Avg speed", value: stats.averageSpeedKmh === null ? "No data" : `${stats.averageSpeedKmh} km/h` }
  ]);
</script>

<header class="section-header">
  <div class="section-title">
    <h2>{title}</h2>
    {#if subtitle}
      <p>{subtitle}</p>
    {/if}
  </div>
  <div class="section-stats" aria-label={`${title} summary`}>
    {#each statCards as stat}
      <article class="section-stat">
        <span>{stat.label}</span>
        <strong>{stat.value}</strong>
      </article>
    {/each}
  </div>
</header>

<style>
  .section-header {
    display: grid;
    gap: 16px;
  }

  .section-title {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: baseline;
    justify-content: space-between;
  }

  .section-title h2 {
    margin-bottom: 0;
    color: var(--section-heading);
    font-size: 1.25rem;
  }

  .section-title p {
    margin-bottom: 0;
    color: #637268;
    font-weight: 700;
  }

  .section-stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(120px, 1fr));
    gap: 10px;
  }

  .section-stat {
    position: relative;
    min-width: 0;
    overflow: hidden;
    padding: 12px 14px 12px 16px;
    border: 1px solid var(--section-stat-border);
    border-radius: 8px;
    background:
      radial-gradient(circle at top right, var(--section-stat-glow), transparent 54%),
      rgba(255, 255, 255, 0.78);
  }

  .section-stat::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--section-heading);
  }

  .section-stat span,
  .section-stat strong {
    position: relative;
  }

  .section-stat span {
    display: block;
    color: #637268;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .section-stat strong {
    display: block;
    margin-top: 7px;
    font-size: clamp(1rem, 1.4vw, 1.45rem);
    line-height: 1.1;
  }

  @media (max-width: 1100px) {
    .section-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .section-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 420px) {
    .section-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
