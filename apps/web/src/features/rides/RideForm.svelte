<script lang="ts">
  import type { AppSettings, Location, Ride, RideInput } from "../../lib/api/pedalyticsApi";
  import RideRouteMap from "./RideRouteMap.svelte";

  let {
    ride = null,
    locations,
    settings = null,
    onSave,
    onCancel
  }: {
    ride?: Ride | null;
    locations: Location[];
    settings?: AppSettings | null;
    onSave: (input: RideInput) => void;
    onCancel: () => void;
  } = $props();

  const today = new Date().toISOString().slice(0, 10);
  let activeRideKey = $state("");
  let distanceKm = $state("0");
  let departureLocationId = $state("");
  let destinationLocationId = $state("");
  let departureLocation = $derived(locations.find((location) => String(location.id) === departureLocationId) ?? null);
  let destinationLocation = $derived(locations.find((location) => String(location.id) === destinationLocationId) ?? null);

  $effect(() => {
    const rideKey = ride?.id == null ? `new-${settings?.homeLocationId ?? ""}` : String(ride.id);
    if (activeRideKey === rideKey) return;

    activeRideKey = rideKey;
    distanceKm = ride?.distanceKm == null ? "0" : String(ride.distanceKm);
    departureLocationId = ride?.departureLocationId == null ? String(settings?.homeLocationId ?? "") : String(ride.departureLocationId);
    destinationLocationId = ride?.destinationLocationId == null ? "" : String(ride.destinationLocationId);
  });

  function nullableNumber(value: FormDataEntryValue | null) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : null;
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    onSave({
      rideDate: String(data.get("rideDate")),
      startedAt: String(data.get("startedAt") || "") || null,
      endedAt: String(data.get("endedAt") || "") || null,
      distanceKm: Number(data.get("distanceKm")),
      maxSpeedKmh: nullableNumber(data.get("maxSpeedKmh")),
      averageSpeedKmh: nullableNumber(data.get("averageSpeedKmh")),
      departureLocationId: nullableNumber(data.get("departureLocationId")),
      destinationLocationId: nullableNumber(data.get("destinationLocationId")),
      notes: String(data.get("notes") || "") || null
    });
  }
</script>

<form class="panel form-grid" onsubmit={submit}>
  <label>Ride date<input name="rideDate" type="date" max={today} value={ride?.rideDate ?? today} required /></label>
  <label>Distance km<input name="distanceKm" type="number" min="0.1" step="0.1" bind:value={distanceKm} required /></label>
  <label>Max speed km/h<input name="maxSpeedKmh" type="number" min="0.1" step="0.1" value={ride?.maxSpeedKmh ?? ""} /></label>
  <label>Average speed km/h<input name="averageSpeedKmh" type="number" min="0.1" step="0.1" value={ride?.averageSpeedKmh ?? ""} /></label>
  <label>Start time<input name="startedAt" type="time" value={ride?.startedAt ?? ""} /></label>
  <label>End time<input name="endedAt" type="time" value={ride?.endedAt ?? ""} /></label>
  <label>
    Departure
    <select name="departureLocationId" bind:value={departureLocationId}>
      <option value="">None</option>
      {#each locations as location}
        <option value={String(location.id)}>{location.name}</option>
      {/each}
    </select>
  </label>
  <label>
    Destination
    <select name="destinationLocationId" bind:value={destinationLocationId}>
      <option value="">None</option>
      {#each locations as location}
        <option value={String(location.id)}>{location.name}</option>
      {/each}
    </select>
  </label>
  <RideRouteMap departure={departureLocation} destination={destinationLocation} distanceKm={Number(distanceKm)} />
  <label class="full">Notes<textarea name="notes" rows="3" value={ride?.notes ?? ""}></textarea></label>
  <div class="actions full">
    <button class="button" type="submit">{ride ? "Update ride" : "Create ride"}</button>
    <button class="button secondary" type="button" onclick={onCancel}>Cancel</button>
  </div>
</form>
