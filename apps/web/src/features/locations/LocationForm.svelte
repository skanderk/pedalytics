<script lang="ts">
  import type { Location, LocationInput } from "../../lib/api/pedalyticsApi";

  let {
    location = null,
    error = "",
    onSave,
    onCancel
  }: {
    location?: Location | null;
    error?: string;
    onSave: (input: LocationInput) => void;
    onCancel: () => void;
  } = $props();

  let activeLocationId = $state<number | null | undefined>(undefined);
  let latitude = $state("");
  let longitude = $state("");
  let previewMapUrl = $derived(mapUrl(latitude, longitude));

  $effect(() => {
    const locationId = location?.id ?? null;
    if (activeLocationId === locationId) return;

    activeLocationId = locationId;
    latitude = location?.latitude == null ? "" : String(location.latitude);
    longitude = location?.longitude == null ? "" : String(location.longitude);
  });

  function nullableNumber(value: FormDataEntryValue | null) {
    const text = String(value ?? "");
    return text ? Number(text) : null;
  }

  function nullableText(value: FormDataEntryValue | null) {
    return String(value ?? "").trim() || null;
  }

  function coordinate(value: string, min: number, max: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
  }

  function mapUrl(latitudeValue: string, longitudeValue: string) {
    const lat = coordinate(latitudeValue, -90, 90);
    const lon = coordinate(longitudeValue, -180, 180);
    if (lat === null || lon === null) return null;

    const padding = 0.01;
    const bbox = [lon - padding, lat - padding, lon + padding, lat + padding].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    onSave({
      name: String(data.get("name")),
      address: String(data.get("address") || "") || null,
      city: String(data.get("city")),
      provinceState: nullableText(data.get("provinceState")),
      country: String(data.get("country")),
      zipCode: String(data.get("zipCode") || "") || null,
      latitude: nullableNumber(data.get("latitude")),
      longitude: nullableNumber(data.get("longitude"))
    });
  }
</script>

<form class="panel form-grid" onsubmit={submit}>
  {#if error}
    <div class="form-error full" role="alert">{error}</div>
  {/if}
  <label>Name<input name="name" value={location?.name ?? ""} required /></label>
  <label>Address<input name="address" value={location?.address ?? ""} /></label>
  <label>City<input name="city" value={location?.city ?? ""} required /></label>
  <label>Province/state<input name="provinceState" value={location?.provinceState ?? ""} /></label>
  <label>Country<input name="country" value={location?.country ?? ""} required /></label>
  <label>Zip code<input name="zipCode" value={location?.zipCode ?? ""} /></label>
  <label>Latitude<input name="latitude" type="number" step="any" bind:value={latitude} /></label>
  <label>Longitude<input name="longitude" type="number" step="any" bind:value={longitude} /></label>
  {#if previewMapUrl}
    <div class="location-map full">
      <iframe title={`Map for ${location?.name ?? "location"}`} src={previewMapUrl}></iframe>
    </div>
  {/if}
  <div class="actions full">
    <button class="button" type="submit">{location ? "Update location" : "Create location"}</button>
    <button class="button secondary" type="button" onclick={onCancel}>Cancel</button>
  </div>
</form>
