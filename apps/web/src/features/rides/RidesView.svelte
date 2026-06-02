<script lang="ts">
  import { onMount } from "svelte";
  import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Eye, Plus, Pencil, Sun, Trash2 } from "@lucide/svelte";
  import { pedalyticsApi, type AppSettings, type Location, type Ride, type RideInput } from "../../lib/api/pedalyticsApi";
  import { formatDate } from "../../lib/formatting/date";
  import { formatKilometers, formatOptionalKilometersPerHour } from "../../lib/formatting/distance";
  import RideForm from "./RideForm.svelte";
  import RideRouteMap from "./RideRouteMap.svelte";

  let rides = $state<Ride[]>([]);
  let locations = $state<Location[]>([]);
  let settings = $state<AppSettings | null>(null);
  let maybeEditedRide = $state<Ride | null>(null);
  let selectedRideId = $state<number | null>(null);
  let showForm = $state(false);
  let error = $state("");
  let saveError = $state("");

  const locationName = (id: number | null) => locations.find((location) => location.id === id)?.name ?? "Unassigned";
  const selectedRide = $derived(rides.find((ride) => ride.id === selectedRideId) ?? null);

  async function load() {
    try {
      error = "";
      [rides, locations, settings] = await Promise.all([pedalyticsApi.listRides(), pedalyticsApi.listLocations(), pedalyticsApi.getSettings()]);
      if (selectedRideId && !rides.some((ride) => ride.id === selectedRideId)) {
        selectedRideId = null;
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Rides could not be loaded";
    }
  }

  async function save(input: RideInput) {
    try {
      saveError = "";
      const ride = maybeEditedRide
        ? await pedalyticsApi.updateRide(maybeEditedRide.id, input)
        : await pedalyticsApi.createRide(input);
      selectedRideId = ride.id;
      showForm = false;
      maybeEditedRide = null;
      await load();
    } catch (caught) {
      saveError = caught instanceof Error ? caught.message : "Ride could not be saved";
    }
  }

  async function remove(id: number) {
    try {
      error = "";
      await pedalyticsApi.deleteRide(id);
      if (selectedRideId === id) selectedRideId = null;
      await load();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Ride could not be deleted";
    }
  }

  function openCreateForm() {
    maybeEditedRide = null;
    saveError = "";
    showForm = true;
  }

  function openEditForm(ride: Ride) {
    maybeEditedRide = ride;
    selectedRideId = ride.id;
    saveError = "";
    showForm = true;
  }

  function toggleDetails(ride: Ride) {
    selectedRideId = selectedRideId === ride.id ? null : ride.id;
    showForm = false;
    saveError = "";
  }

  function rowKeydown(event: KeyboardEvent, ride: Ride) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleDetails(ride);
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation();
  }

  function locationById(id: number | null) {
    return locations.find((location) => location.id === id) ?? null;
  }

  function valueOrEmpty(value: string | number | null) {
    return value ?? "n/a";
  }

  function formatCelsius(value: number | null) {
    return value == null ? "n/a" : `${value.toFixed(1)} °C`;
  }

  function formatMillimeters(value: number | null) {
    return value == null ? "n/a" : `${value.toFixed(1)} mm`;
  }

  function windText(ride: Ride) {
    const direction = [
      ride.weatherWindDirectionCardinal,
      ride.weatherWindDirectionDegrees == null ? null : `${ride.weatherWindDirectionDegrees}°`
    ].filter(Boolean).join(" ");

    if (!direction && ride.weatherWindSpeedKmh == null) return "n/a";
    return [direction || null, ride.weatherWindSpeedKmh == null ? null : `${ride.weatherWindSpeedKmh} km/h`].filter(Boolean).join(", ");
  }

  function weatherConditionLabel(code: number | null) {
    if (code == null) return "Weather unavailable";
    if (code === 0) return "Clear";
    if (code <= 3) return "Cloudy";
    if (code <= 48) return "Fog";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    if (code <= 86) return "Snow showers";
    if (code <= 99) return "Thunderstorm";
    return "Weather";
  }

  function weatherConditionClass(code: number | null) {
    if (code == null) return "weather-badge-unavailable";
    if (code === 0) return "weather-badge-clear";
    if (code <= 3) return "weather-badge-cloudy";
    if (code <= 48) return "weather-badge-fog";
    if (code <= 67) return "weather-badge-rain";
    if (code <= 77) return "weather-badge-snow";
    if (code <= 82) return "weather-badge-rain";
    if (code <= 86) return "weather-badge-snow";
    if (code <= 99) return "weather-badge-thunderstorm";
    return "weather-badge-unavailable";
  }

  onMount(load);
</script>

<header class="view-header">
  <div>
    <h1>Rides</h1>
    <p class="muted">Manual entries for completed round trips.</p>
  </div>
  <button class="button" onclick={openCreateForm}><Plus size={18} />New ride</button>
</header>

{#if error}<div class="panel">{error}</div>{/if}
{#if showForm}
  {#key maybeEditedRide?.id ?? "new"}
    <RideForm {locations} {settings} ride={maybeEditedRide} error={saveError} onSave={save} onCancel={() => (showForm = false)} />
  {/key}
{/if}

<section class="panel">
  {#if rides.length}
    <div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Distance</th><th>Max speed</th><th>Average speed</th><th>Route</th><th>Wind</th><th>Notes</th><th class="actions-cell"></th></tr></thead>
        <tbody>
          {#each rides as ride, index}
            <tr
              class:odd-ride-row={index % 2 === 0}
              class:even-ride-row={index % 2 === 1}
              class:selected-row={selectedRideId === ride.id}
              class="clickable-row"
              role="button"
              tabindex="0"
              aria-expanded={selectedRideId === ride.id}
              aria-controls={`ride-details-${ride.id}`}
              onclick={() => toggleDetails(ride)}
              onkeydown={(event) => rowKeydown(event, ride)}
            >
              <td>{formatDate(ride.rideDate)}</td>
              <td>{formatKilometers(ride.distanceKm)}</td>
              <td>{formatOptionalKilometersPerHour(ride.maxSpeedKmh)}</td>
              <td>{formatOptionalKilometersPerHour(ride.averageSpeedKmh)}</td>
              <td>{locationName(ride.departureLocationId)} to {locationName(ride.destinationLocationId)}</td>
              <td>{windText(ride)}</td>
              <td>{ride.notes ?? ""}</td>
              <td class="actions actions-cell" onclick={stopRowClick}>
                <button class="button secondary" title="View ride details" aria-label={`View details for ride on ${formatDate(ride.rideDate)}`} onclick={() => toggleDetails(ride)}><Eye size={16} /></button>
                <button class="button secondary" title="Edit ride" aria-label={`Edit ride on ${formatDate(ride.rideDate)}`} onclick={() => openEditForm(ride)}><Pencil size={16} /></button>
                <button class="button danger" title="Delete ride" aria-label={`Delete ride on ${formatDate(ride.rideDate)}`} onclick={() => remove(ride.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
            {#if selectedRide?.id === ride.id}
              <tr class="details-row">
                <td colspan="8">
                  <section class="ride-details" id={`ride-details-${ride.id}`} aria-label={`Details for ride on ${formatDate(ride.rideDate)}`}>
                    <div class="record-details-header">
                      <div>
                        <h2>{formatDate(ride.rideDate)}</h2>
                        <p class="muted">{locationName(ride.departureLocationId)} to {locationName(ride.destinationLocationId)}</p>
                      </div>
                      <div class="actions">
                        <button class="button secondary" type="button" onclick={() => openEditForm(ride)}><Pencil size={16} />Edit</button>
                      </div>
                    </div>
                    <section class="detail-section">
                      <h3>Ride</h3>
                      <dl class="detail-grid">
                        <div><dt>Date</dt><dd>{formatDate(ride.rideDate)}</dd></div>
                        <div><dt>Distance</dt><dd>{formatKilometers(ride.distanceKm)}</dd></div>
                        <div><dt>Max speed</dt><dd>{formatOptionalKilometersPerHour(ride.maxSpeedKmh)}</dd></div>
                        <div><dt>Average speed</dt><dd>{formatOptionalKilometersPerHour(ride.averageSpeedKmh)}</dd></div>
                        <div><dt>Start time</dt><dd>{valueOrEmpty(ride.startedAt)}</dd></div>
                        <div><dt>End time</dt><dd>{valueOrEmpty(ride.endedAt)}</dd></div>
                      </dl>
                    </section>
                    <section class="detail-section">
                      <h3>Route</h3>
                      <dl class="detail-grid">
                        <div><dt>Departure</dt><dd>{locationName(ride.departureLocationId)}</dd></div>
                        <div><dt>Destination</dt><dd>{locationName(ride.destinationLocationId)}</dd></div>
                      </dl>
                      <RideRouteMap departure={locationById(ride.departureLocationId)} destination={locationById(ride.destinationLocationId)} distanceKm={ride.distanceKm} />
                    </section>
                    <section class="detail-section">
                      <div class="detail-section-heading">
                        <h3>Weather</h3>
                        <span class={`weather-badge ${weatherConditionClass(ride.weatherCode)}`}>
                          {#if ride.weatherCode === 0}
                            <Sun size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 3}
                            <CloudSun size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 48}
                            <CloudFog size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 67}
                            <CloudRain size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 77}
                            <CloudSnow size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 82}
                            <CloudRain size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 86}
                            <CloudSnow size={20} />
                          {:else if ride.weatherCode != null && ride.weatherCode <= 99}
                            <CloudLightning size={20} />
                          {:else}
                            <Cloud size={20} />
                          {/if}
                          {weatherConditionLabel(ride.weatherCode)}
                        </span>
                      </div>
                      <dl class="detail-grid">
                        <div><dt>Temperature</dt><dd>{formatCelsius(ride.weatherTemperatureCelsius)}</dd></div>
                        <div><dt>Feels like</dt><dd>{formatCelsius(ride.weatherFeelsLikeCelsius)}</dd></div>
                        <div><dt>Precipitation</dt><dd>{formatMillimeters(ride.weatherPrecipitationMm)}</dd></div>
                        <div><dt>Rain</dt><dd>{formatMillimeters(ride.weatherRainMm)}</dd></div>
                        <div><dt>Wind</dt><dd>{windText(ride)}</dd></div>
                      </dl>
                    </section>
                    <section class="detail-section">
                      <h3>Notes</h3>
                      <p class="detail-notes">{valueOrEmpty(ride.notes)}</p>
                    </section>
                  </section>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="empty-state">No rides yet.</div>
  {/if}
</section>
