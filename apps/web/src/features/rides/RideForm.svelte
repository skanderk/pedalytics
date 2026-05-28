<script lang="ts">
  import type { AppSettings, Location, Ride, RideInput } from "../../lib/api/pedalyticsApi";

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
  <label>Distance km<input name="distanceKm" type="number" min="0.1" step="0.1" value={ride?.distanceKm ?? 0} required /></label>
  <label>Max speed km/h<input name="maxSpeedKmh" type="number" min="0.1" step="0.1" value={ride?.maxSpeedKmh ?? ""} /></label>
  <label>Average speed km/h<input name="averageSpeedKmh" type="number" min="0.1" step="0.1" value={ride?.averageSpeedKmh ?? ""} /></label>
  <label>Start time<input name="startedAt" type="time" value={ride?.startedAt ?? ""} /></label>
  <label>End time<input name="endedAt" type="time" value={ride?.endedAt ?? ""} /></label>
  <label>
    Departure
    <select name="departureLocationId" value={ride?.departureLocationId ?? settings?.homeLocationId ?? ""}>
      <option value="">None</option>
      {#each locations as location}
        <option value={location.id}>{location.name}</option>
      {/each}
    </select>
  </label>
  <label>
    Destination
    <select name="destinationLocationId" value={ride?.destinationLocationId ?? ""}>
      <option value="">None</option>
      {#each locations as location}
        <option value={location.id}>{location.name}</option>
      {/each}
    </select>
  </label>
  <label class="full">Notes<textarea name="notes" rows="3" value={ride?.notes ?? ""}></textarea></label>
  <div class="actions full">
    <button class="button" type="submit">{ride ? "Update ride" : "Create ride"}</button>
    <button class="button secondary" type="button" onclick={onCancel}>Cancel</button>
  </div>
</form>
