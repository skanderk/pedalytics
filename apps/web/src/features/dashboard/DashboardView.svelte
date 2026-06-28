<script lang="ts">
  import { onMount } from "svelte";
  import { pedalyticsApi, type DashboardDailyStats, type DashboardMonthlyStats, type DashboardYearlyStats } from "../../lib/api/pedalyticsApi";
  import { formatKilometers } from "../../lib/formatting/distance";
  import DistanceChart from "./DistanceChart.svelte";

  const currentDate = new Date();
  let year = $state(currentDate.getFullYear());
  let month = $state(currentDate.getMonth() + 1);
  let showAverageSpeed = $state(true);
  let showMaxSpeed = $state(false);
  let dailyStats = $state<DashboardDailyStats | null>(null);
  let monthlyStats = $state<DashboardMonthlyStats | null>(null);
  let yearlyStats = $state<DashboardYearlyStats | null>(null);
  let error = $state("");

  const months = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2026, index, 1).toLocaleString(undefined, { month: "long" }) }));
  const shortMonths = Array.from({ length: 12 }, (_, index) => new Date(2026, index, 1).toLocaleString(undefined, { month: "short" }));
  const selectedMonthLabel = $derived(months.find((item) => item.value === month)?.label ?? "Selected month");
  const dailyDistancePoints = $derived(
    dailyStats?.dayMetrics.map((point) => ({
      label: String(Number(point.rideDate.slice(8, 10))),
      distanceKm: point.totalDistanceKm,
      rideCount: point.rideCount,
      averageDistanceKm: point.averageDistanceKm,
      longestRideKm: point.longestRideKm,
      averageSpeedKmh: point.averageSpeedKmh,
      maxSpeedKmh: point.maxSpeedKmh
    })) ?? []
  );
  const monthlyDistancePoints = $derived(
    monthlyStats?.monthMetrics.map((point) => ({
      label: shortMonths[point.month - 1],
      distanceKm: point.totalDistanceKm,
      rideCount: point.rideCount,
      averageDistanceKm: point.averageDistanceKm,
      longestRideKm: point.longestRideKm,
      averageSpeedKmh: point.averageSpeedKmh,
      maxSpeedKmh: point.maxSpeedKmh
    })) ?? []
  );
  const yearlyDistancePoints = $derived(
    yearlyStats?.yearMetrics.map((point) => ({
      label: String(point.year),
      distanceKm: point.totalDistanceKm,
      rideCount: point.rideCount,
      averageDistanceKm: point.averageDistanceKm,
      longestRideKm: point.longestRideKm,
      averageSpeedKmh: point.averageSpeedKmh,
      maxSpeedKmh: point.maxSpeedKmh
    })) ?? []
  );

  async function loadDailyStats() {
    try {
      error = "";
      dailyStats = await pedalyticsApi.getDailyDashboard(year, month);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  async function loadMonthlyStats() {
    try {
      error = "";
      monthlyStats = await pedalyticsApi.getMonthlyDashboard(year);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  async function loadYearlyStats() {
    try {
      error = "";
      yearlyStats = await pedalyticsApi.getYearlyDashboard();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  async function loadDashboard() {
    await Promise.all([loadDailyStats(), loadMonthlyStats(), loadYearlyStats()]);
  }

  async function handleYearChange() {
    await Promise.all([loadDailyStats(), loadMonthlyStats()]);
  }

  onMount(loadDashboard);
</script>

<header class="view-header dashboard-header">
  <div>
    <h1>Dashboard</h1>
    <p class="muted">A clean pulse check on your completed rides.</p>
  </div>
  <div class="toolbar dashboard-filter-card" aria-label="Dashboard filters">
    <label class="filter-field">
      <span>Year</span>
      <input aria-label="Year" type="number" bind:value={year} min="2000" max="2100" onchange={handleYearChange} />
    </label>
    <label class="filter-field">
      <span>Month</span>
      <select aria-label="Month" bind:value={month} onchange={loadDailyStats}>
        {#each months as item}
          <option value={item.value}>{item.label}</option>
        {/each}
      </select>
    </label>
    <div class="layer-controls" aria-label="Chart layers">
      <span>Chart layers</span>
      <label class="layer-toggle">
        <input type="checkbox" bind:checked={showAverageSpeed} />
        Avg speed
      </label>
      <label class="layer-toggle">
        <input type="checkbox" bind:checked={showMaxSpeed} />
        Max speed
      </label>
    </div>
  </div>
</header>

{#if error}
  <div class="panel">{error}</div>
{:else if dailyStats && monthlyStats && yearlyStats}
  <section class="card-grid">
    <article class="card stat-card stat-card-distance"><span>Total distance</span><strong>{formatKilometers(dailyStats.totalDistanceKm)}</strong></article>
    <article class="card stat-card stat-card-rides"><span>Rides</span><strong>{dailyStats.rideCount}</strong></article>
    <article class="card stat-card stat-card-average"><span>Average ride</span><strong>{formatKilometers(dailyStats.averageDistanceKm)}</strong></article>
    <article class="card stat-card stat-card-longest"><span>Longest ride</span><strong>{formatKilometers(dailyStats.longestRideKm)}</strong></article>
  </section>

  <section class="dashboard-charts">
    <article class="panel chart-panel chart-panel-daily daily-chart">
      <h2>Distance by day in {selectedMonthLabel} {year}</h2>
      <DistanceChart
        ariaLabel="Distance by day chart"
        averageSpeedColor="#184d38"
        barColor="#1c7c54"
        maxSpeedColor="#b64232"
        points={dailyDistancePoints}
        {showAverageSpeed}
        {showMaxSpeed}
      />
    </article>

    <article class="panel chart-panel chart-panel-monthly">
      <h2>Distance by month in {year}</h2>
      <DistanceChart
        ariaLabel="Distance by month chart"
        averageSpeedColor="#1f5377"
        barColor="#2f6f9f"
        maxSpeedColor="#b64232"
        points={monthlyDistancePoints}
        {showAverageSpeed}
        {showMaxSpeed}
      />
    </article>

    <article class="panel chart-panel chart-panel-yearly">
      <h2>Distance by year</h2>
      {#if yearlyDistancePoints.length}
        <DistanceChart
          ariaLabel="Distance by year chart"
          averageSpeedColor="#5f4c1b"
          barColor="#8a6f2a"
          maxSpeedColor="#b64232"
          points={yearlyDistancePoints}
          {showAverageSpeed}
          {showMaxSpeed}
        />
      {:else}
        <div class="empty-state">No rides found yet.</div>
      {/if}
    </article>
  </section>
{/if}

<style>
  .dashboard-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
  }

  .stat-card {
    --stat-bg:
      radial-gradient(circle at top right, rgba(28, 124, 84, 0.12), transparent 42%),
      linear-gradient(135deg, #ffffff 0%, #f3fbef 100%);
    --stat-border: #cfe2c6;
    --stat-accent: #1c7c54;
    position: relative;
    overflow: hidden;
    border-color: var(--stat-border);
    background: var(--stat-bg);
    box-shadow:
      0 12px 24px rgba(23, 32, 27, 0.07),
      0 2px 6px rgba(23, 32, 27, 0.04);
  }

  .stat-card::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--stat-accent);
  }

  .stat-card span,
  .stat-card strong {
    position: relative;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-filter-card {
    align-self: center;
    justify-content: center;
    align-items: end;
    width: fit-content;
    padding: 14px;
    border: 1px solid #dfe7dd;
    border-radius: 8px;
    background: #ffffff;
    box-shadow:
      0 18px 38px rgba(16, 37, 29, 0.14),
      0 3px 10px rgba(16, 37, 29, 0.08);
  }

  .filter-field {
    min-width: 160px;
    text-align: left;
  }

  .filter-field span {
    color: #405149;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .layer-controls {
    display: grid;
    gap: 8px;
    min-width: 190px;
  }

  .layer-controls > span {
    color: #405149;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .layer-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #17201b;
    font-size: 0.92rem;
  }

  .layer-toggle input {
    width: 16px;
    height: 16px;
    padding: 0;
    accent-color: #1c7c54;
  }

  .dashboard-charts .panel {
    margin-top: 0;
    min-width: 0;
  }

  .chart-panel {
    border-color: var(--chart-border);
    background: var(--chart-bg);
    box-shadow:
      0 16px 32px rgba(23, 32, 27, 0.08),
      0 2px 6px rgba(23, 32, 27, 0.04);
  }

  .chart-panel h2 {
    color: var(--chart-heading);
  }

  .chart-panel-daily {
    --chart-bg:
      radial-gradient(circle at top left, rgba(28, 124, 84, 0.14), transparent 34%),
      linear-gradient(135deg, #f3fbef 0%, #ffffff 58%, #eef8eb 100%);
    --chart-border: #cfe2c6;
    --chart-heading: #1c7c54;
  }

  .chart-panel-monthly {
    --chart-bg:
      radial-gradient(circle at top left, rgba(47, 111, 159, 0.14), transparent 34%),
      linear-gradient(135deg, #eef8fd 0%, #ffffff 58%, #edf6fb 100%);
    --chart-border: #c9dce8;
    --chart-heading: #2f6f9f;
  }

  .chart-panel-yearly {
    --chart-bg:
      radial-gradient(circle at top left, rgba(138, 111, 42, 0.16), transparent 34%),
      linear-gradient(135deg, #fff6db 0%, #ffffff 58%, #fbf3df 100%);
    --chart-border: #e5d8ad;
    --chart-heading: #77601f;
  }

  .daily-chart {
    grid-column: 1 / -1;
  }

  @media (max-width: 900px) {
    .dashboard-charts {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .dashboard-filter-card {
      width: 100%;
    }

    .filter-field {
      min-width: 0;
      width: 100%;
    }

    .layer-controls {
      width: 100%;
    }
  }
</style>
