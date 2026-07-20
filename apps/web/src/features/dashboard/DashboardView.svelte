<script lang="ts">
  import { onMount } from "svelte";
  import { pedalyticsApi, type DashboardDailyStats, type DashboardMonthlyStats, type DashboardYearlyStats } from "../../lib/api/pedalyticsApi";
  import DashboardSection from "./DashboardSection.svelte";
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
  const availableYears = $derived(yearlyStats?.yearMetrics.filter((item) => item.rideCount > 0).map((item) => item.year) ?? []);
  const availableMonths = $derived(
    monthlyStats?.monthMetrics
      .filter((item) => item.rideCount > 0)
      .map((item) => months[item.month - 1]) ?? []
  );
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

  async function loadDashboard() {
    try {
      error = "";
      yearlyStats = await pedalyticsApi.getYearlyDashboard();

      const yearsWithData = yearlyStats.yearMetrics.filter((item) => item.rideCount > 0).map((item) => item.year);
      if (yearsWithData.length && !yearsWithData.includes(year)) {
        year = yearsWithData.at(-1) ?? year;
      }

      await loadSelectedYear();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  async function handleYearChange() {
    try {
      error = "";
      await loadSelectedYear();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  async function loadSelectedYear() {
    monthlyStats = await pedalyticsApi.getMonthlyDashboard(year);
    const monthsWithData = monthlyStats.monthMetrics.filter((item) => item.rideCount > 0).map((item) => item.month);

    if (monthsWithData.length && !monthsWithData.includes(month)) {
      month = monthsWithData.at(-1) ?? month;
    }

    dailyStats = await pedalyticsApi.getDailyDashboard(year, month);
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
      <select aria-label="Year" bind:value={year} onchange={handleYearChange} disabled={!availableYears.length}>
        {#each availableYears as availableYear}
          <option value={availableYear}>{availableYear}</option>
        {/each}
      </select>
    </label>
    <label class="filter-field">
      <span>Month</span>
      <select aria-label="Month" bind:value={month} onchange={loadDailyStats} disabled={!availableMonths.length}>
        {#each availableMonths as item}
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
  <section class="dashboard-charts">
    <DashboardSection stats={dailyStats} subtitle={String(year)} title={`Stats of ${selectedMonthLabel}`} tone="daily">
      <DistanceChart
        ariaLabel="Distance by day chart"
        averageSpeedColor="#184d38"
        barColor="#1c7c54"
        maxSpeedColor="#b64232"
        points={dailyDistancePoints}
        {showAverageSpeed}
        {showMaxSpeed}
      />
    </DashboardSection>

    <DashboardSection stats={monthlyStats} title={`Stats of ${year}`} tone="monthly">
      <DistanceChart
        ariaLabel="Distance by month chart"
        averageSpeedColor="#1f5377"
        barColor="#2f6f9f"
        maxSpeedColor="#b64232"
        points={monthlyDistancePoints}
        {showAverageSpeed}
        {showMaxSpeed}
      />
    </DashboardSection>

    <DashboardSection class="global-chart" stats={yearlyStats} title="Global" tone="global">
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
    </DashboardSection>
  </section>
{/if}

<style>
  .dashboard-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
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

  :global(.global-chart) {
    grid-column: 1 / -1;
    width: calc(50% - 9px);
    justify-self: center;
  }

  @media (max-width: 900px) {
    .dashboard-charts {
      grid-template-columns: 1fr;
    }

    :global(.global-chart) {
      grid-column: auto;
      width: auto;
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
