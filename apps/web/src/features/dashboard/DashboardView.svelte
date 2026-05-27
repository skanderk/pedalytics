<script lang="ts">
  import { onMount } from "svelte";
  import { pedalyticsApi, type DashboardStats } from "../../lib/api/pedalyticsApi";
  import { formatKilometers } from "../../lib/formatting/distance";
  import DistanceChart from "./DistanceChart.svelte";

  const currentDate = new Date();
  let year = $state(currentDate.getFullYear());
  let month = $state(currentDate.getMonth() + 1);
  let stats = $state<DashboardStats | null>(null);
  let error = $state("");

  const months = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2026, index, 1).toLocaleString(undefined, { month: "long" }) }));

  async function loadDashboard() {
    try {
      error = "";
      stats = await pedalyticsApi.getDashboard(year, month);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Dashboard failed to load";
    }
  }

  onMount(loadDashboard);
</script>

<header class="view-header">
  <div>
    <h1>Dashboard</h1>
    <p class="muted">A clean pulse check on your completed rides.</p>
  </div>
  <div class="toolbar">
    <input aria-label="Year" type="number" bind:value={year} min="2000" max="2100" onchange={loadDashboard} />
    <select aria-label="Month" bind:value={month} onchange={loadDashboard}>
      {#each months as item}
        <option value={item.value}>{item.label}</option>
      {/each}
    </select>
  </div>
</header>

{#if error}
  <div class="panel">{error}</div>
{:else if stats}
  <section class="card-grid">
    <article class="card"><span>Total distance</span><strong>{formatKilometers(stats.totalDistanceKm)}</strong></article>
    <article class="card"><span>Rides</span><strong>{stats.rideCount}</strong></article>
    <article class="card"><span>Average ride</span><strong>{formatKilometers(stats.averageDistanceKm)}</strong></article>
    <article class="card"><span>Longest ride</span><strong>{formatKilometers(stats.longestRideKm)}</strong></article>
  </section>

  <section class="panel">
    <h2>Distance by day</h2>
    {#if stats.distanceByDay.length}
      <DistanceChart points={stats.distanceByDay} />
    {:else}
      <div class="empty-state">No rides found for this filter.</div>
    {/if}
  </section>
{/if}
