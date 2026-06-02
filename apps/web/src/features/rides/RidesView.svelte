<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Pencil, Trash2 } from "@lucide/svelte";
  import { pedalyticsApi, type AppSettings, type Location, type Ride, type RideInput } from "../../lib/api/pedalyticsApi";
  import { formatDate } from "../../lib/formatting/date";
  import { formatKilometers, formatOptionalKilometersPerHour } from "../../lib/formatting/distance";
  import RideForm from "./RideForm.svelte";

  let rides = $state<Ride[]>([]);
  let locations = $state<Location[]>([]);
  let settings = $state<AppSettings | null>(null);
  let maybeEditedRide = $state<Ride | null>(null);
  let showForm = $state(false);
  let error = $state("");

  const locationName = (id: number | null) => locations.find((location) => location.id === id)?.name ?? "Unassigned";

  async function load() {
    [rides, locations, settings] = await Promise.all([pedalyticsApi.listRides(), pedalyticsApi.listLocations(), pedalyticsApi.getSettings()]);
  }

  async function save(input: RideInput) {
    try {
      if (maybeEditedRide) await pedalyticsApi.updateRide(maybeEditedRide.id, input);
      else await pedalyticsApi.createRide(input);
      showForm = false;
      maybeEditedRide = null;
      await load();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "❌ Ride could not be saved";
    }
  }

  async function remove(id: number) {
    await pedalyticsApi.deleteRide(id);
    await load();
  }

  onMount(load);
</script>

<header class="view-header">
  <div>
    <h1>Rides</h1>
    <p class="muted">Manual entries for completed round trips.</p>
  </div>
  <button class="button" onclick={() => { maybeEditedRide = null; showForm = true; }}><Plus size={18} />New ride</button>
</header>

{#if error}<div class="panel">{error}</div>{/if}
{#if showForm}
  {#key maybeEditedRide?.id ?? "new"}
    <RideForm {locations} {settings} ride={maybeEditedRide} onSave={save} onCancel={() => (showForm = false)} />
  {/key}
{/if}

<section class="panel">
  {#if rides.length}
    <div class="table-scroll">
      <table>
        <thead><tr><th>Date</th><th>Distance</th><th>Max speed</th><th>Average speed</th><th>Route</th><th>Wind</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {#each rides as ride}
            <tr>
              <td>{formatDate(ride.rideDate)}</td>
              <td>{formatKilometers(ride.distanceKm)}</td>
              <td>{formatOptionalKilometersPerHour(ride.maxSpeedKmh)}</td>
              <td>{formatOptionalKilometersPerHour(ride.averageSpeedKmh)}</td>
              <td>{locationName(ride.departureLocationId)} to {locationName(ride.destinationLocationId)}</td>
              <td>{ride.weatherWindDirectionCardinal ?? "n/a"} {ride.weatherWindSpeedKmh ? `${ride.weatherWindSpeedKmh} km/h` : ""}</td>
              <td>{ride.notes ?? ""}</td>
              <td class="actions">
                <button class="button secondary" title="Edit ride" onclick={() => { maybeEditedRide = ride; showForm = true; }}><Pencil size={16} /></button>
                <button class="button danger" title="Delete ride" onclick={() => remove(ride.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="empty-state">No rides yet.</div>
  {/if}
</section>
