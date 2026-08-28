<script lang="ts">
  import L from "leaflet";
  import "leaflet.heat";
  import "leaflet/dist/leaflet.css";
  import { onMount } from "svelte";
  import { pedalyticsApi, type DestinationVisit } from "../../lib/api/pedalyticsApi";
  import { heatmapIntensity } from "./heatmapIntensity";

  const montreal: L.LatLngExpression = [45.5017, -73.5673];

  let mapElement: HTMLDivElement;
  let map: L.Map | null = null;
  let visits = $state<DestinationVisit[]>([]);
  let loading = $state(true);
  let error = $state("");
  let disposed = false;

  let totalVisits = $derived(visits.reduce((sum, visit) => sum + visit.visitCount, 0));
  let busiestDestination = $derived(visits[0] ?? null);

  onMount(() => {
    disposed = false;
    void loadHeatmap();
    return () => {
      disposed = true;
      map?.remove();
      map = null;
    };
  });

  async function loadHeatmap() {
    try {
      const [loadedVisits, locations, settings] = await Promise.all([
        pedalyticsApi.getRideHeatmap(),
        pedalyticsApi.listLocations(),
        pedalyticsApi.getSettings()
      ]);
      visits = loadedVisits;

      const home = locations.find((location) => location.id === settings.homeLocationId);
      const fallbackCenter: L.LatLngExpression =
        home?.latitude != null && home.longitude != null ? [home.latitude, home.longitude] : montreal;

      if (!disposed) createMap(fallbackCenter);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Heatmap failed to load";
    } finally {
      loading = false;
    }
  }

  function createMap(fallbackCenter: L.LatLngExpression) {
    map = L.map(mapElement, { zoomControl: true }).setView(fallbackCenter, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    if (!visits.length) return;

    const maxVisitCount = Math.max(...visits.map((visit) => visit.visitCount));
    const heatPoints = visits.map(
      (visit) => [visit.latitude, visit.longitude, heatmapIntensity(visit.visitCount, maxVisitCount)] as L.HeatLatLngTuple
    );

    L.heatLayer(heatPoints, {
      radius: 44,
      blur: 32,
      max: 1,
      minOpacity: 0.18,
      // Keep visit intensity stable while the user zooms in or out.
      maxZoom: 0,
      gradient: {
        0.15: "#2f6f9f",
        0.35: "#35a66f",
        0.55: "#c7d94c",
        0.75: "#f2a93b",
        1: "#c83e32"
      }
    }).addTo(map);

    for (const visit of visits) {
      L.circleMarker([visit.latitude, visit.longitude], {
        radius: 18,
        stroke: false,
        fillOpacity: 0,
        interactive: true
      })
        .bindTooltip(`${visit.name}: ${visit.visitCount} ${visit.visitCount === 1 ? "visit" : "visits"}`, {
          direction: "top",
          offset: [0, -10]
        })
        .addTo(map);
    }

    const totalWeight = visits.reduce((sum, visit) => sum + visit.visitCount, 0);
    const center = L.latLng(
      visits.reduce((sum, visit) => sum + visit.latitude * visit.visitCount, 0) / totalWeight,
      visits.reduce((sum, visit) => sum + visit.longitude * visit.visitCount, 0) / totalWeight
    );
    map.setView(center, 13);
  }
</script>

<header class="view-header heatmap-header">
  <div>
    <h1>Ride heatmap</h1>
    <p class="muted">Every destination you have visited, across all recorded rides.</p>
  </div>
  {#if visits.length}
    <div class="heatmap-summary" aria-label="Heatmap summary">
      <div><span>Destination visits</span><strong>{totalVisits}</strong></div>
      <div><span>Visited places</span><strong>{visits.length}</strong></div>
      <div><span>Most visited</span><strong>{busiestDestination?.name}</strong></div>
    </div>
  {/if}
</header>

{#if error}
  <div class="form-error" role="alert">{error}</div>
{/if}

<section class="heatmap-panel" aria-label="All-time ride destination heatmap">
  <div class="heatmap-map" bind:this={mapElement}></div>

  {#if loading}
    <div class="heatmap-message">Loading your ride history…</div>
  {:else if !error && !visits.length}
    <div class="heatmap-message">
      <strong>No mapped destinations yet</strong>
      <span>Add a destination with coordinates to a ride to begin your heatmap.</span>
    </div>
  {/if}

  {#if visits.length}
    <div class="heatmap-legend" aria-label="Heatmap intensity legend">
      <span>Fewer visits</span>
      <div class="heatmap-gradient"></div>
      <span>More visits</span>
    </div>
  {/if}
</section>

<style>
  .heatmap-header {
    align-items: flex-start;
  }

  .heatmap-summary {
    display: flex;
    gap: 22px;
    padding: 14px 18px;
    border: 1px solid #dfe7dd;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(16, 37, 29, 0.08);
  }

  .heatmap-summary div {
    display: grid;
    gap: 3px;
  }

  .heatmap-summary span {
    color: #637268;
    font-size: 0.76rem;
    text-transform: uppercase;
  }

  .heatmap-summary strong {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .heatmap-panel {
    position: relative;
    min-height: 620px;
    overflow: hidden;
    border: 1px solid #cfdacd;
    border-radius: 8px;
    background: #e6efe3;
    box-shadow: 0 18px 45px rgba(16, 37, 29, 0.1);
  }

  .heatmap-map {
    position: absolute;
    inset: 0;
  }

  .heatmap-message {
    position: absolute;
    z-index: 500;
    left: 50%;
    top: 50%;
    display: grid;
    gap: 6px;
    min-width: min(360px, calc(100% - 40px));
    padding: 18px 22px;
    border: 1px solid #dfe7dd;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 12px 30px rgba(16, 37, 29, 0.16);
    text-align: center;
    transform: translate(-50%, -50%);
  }

  .heatmap-message span {
    color: #637268;
    font-size: 0.9rem;
  }

  .heatmap-legend {
    position: absolute;
    z-index: 500;
    right: 12px;
    bottom: 28px;
    display: grid;
    grid-template-columns: auto 130px auto;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 4px 12px rgba(16, 37, 29, 0.14);
    color: #405149;
    font-size: 0.75rem;
  }

  .heatmap-gradient {
    height: 9px;
    border-radius: 999px;
    background: linear-gradient(90deg, #2f6f9f, #35a66f, #c7d94c, #f2a93b, #c83e32);
  }

  :global(.leaflet-tooltip) {
    border-color: #dfe7dd;
    color: #17201b;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .heatmap-header {
      align-items: stretch;
    }

    .heatmap-summary {
      justify-content: space-between;
    }

    .heatmap-panel {
      min-height: 520px;
    }
  }

  @media (max-width: 620px) {
    .heatmap-summary {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .heatmap-legend {
      left: 50%;
      right: auto;
      grid-template-columns: auto 90px auto;
      transform: translateX(-50%);
      white-space: nowrap;
    }
  }
</style>
