<script lang="ts">
  import type { Location, LocationInput } from "../../lib/api/pedalyticsApi";

  let {
    location = null,
    onSave,
    onCancel
  }: {
    location?: Location | null;
    onSave: (input: LocationInput) => void;
    onCancel: () => void;
  } = $props();

  function nullableNumber(value: FormDataEntryValue | null) {
    const text = String(value ?? "");
    return text ? Number(text) : null;
  }

  function nullableText(value: FormDataEntryValue | null) {
    return String(value ?? "").trim() || null;
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
  <label>Name<input name="name" value={location?.name ?? ""} required /></label>
  <label>Address<input name="address" value={location?.address ?? ""} /></label>
  <label>City<input name="city" value={location?.city ?? ""} required /></label>
  <label>Province/state<input name="provinceState" value={location?.provinceState ?? ""} /></label>
  <label>Country<input name="country" value={location?.country ?? ""} required /></label>
  <label>Zip code<input name="zipCode" value={location?.zipCode ?? ""} /></label>
  <label>Latitude<input name="latitude" type="number" step="any" value={location?.latitude ?? ""} /></label>
  <label>Longitude<input name="longitude" type="number" step="any" value={location?.longitude ?? ""} /></label>
  <div class="actions full">
    <button class="button" type="submit">{location ? "Update location" : "Create location"}</button>
    <button class="button secondary" type="button" onclick={onCancel}>Cancel</button>
  </div>
</form>
