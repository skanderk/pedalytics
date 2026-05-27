<script lang="ts">
  import { onMount } from "svelte";
  import { Save } from "@lucide/svelte";
  import { pedalyticsApi, type AppSettings, type Location, type SettingsInput } from "../../lib/api/pedalyticsApi";

  let settings = $state<AppSettings | null>(null);
  let locations = $state<Location[]>([]);
  let saved = $state("");
  let error = $state("");

  async function load() {
    [settings, locations] = await Promise.all([pedalyticsApi.getSettings(), pedalyticsApi.listLocations()]);
  }

  function nullableNumber(value: FormDataEntryValue | null) {
    const text = String(value ?? "");
    return text ? Number(text) : null;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!settings) return;
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const input: SettingsInput = {
      homeLocationId: nullableNumber(data.get("homeLocationId")),
      defaultCity: String(data.get("defaultCity")),
      defaultProvinceState: String(data.get("defaultProvinceState")),
      defaultCountry: String(data.get("defaultCountry")),
      defaultZipCode: String(data.get("defaultZipCode") || "") || null,
      defaultLatitude: nullableNumber(data.get("defaultLatitude")),
      defaultLongitude: nullableNumber(data.get("defaultLongitude")),
      distanceUnit: "km",
      temperatureUnit: "celsius",
      windSpeedUnit: "kmh"
    };

    try {
      settings = await pedalyticsApi.updateSettings(input);
      saved = "Settings saved.";
      error = "";
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Settings could not be saved";
      saved = "";
    }
  }

  onMount(load);
</script>

<header class="view-header">
  <div>
    <h1>Settings</h1>
    <p class="muted">Home location, defaults, and metric units.</p>
  </div>
</header>

{#if settings}
  <form class="panel form-grid" onsubmit={submit}>
    <label>
      Home location
      <select name="homeLocationId" bind:value={settings.homeLocationId}>
        <option value="">None</option>
        {#each locations as location}
          <option value={location.id}>{location.name}</option>
        {/each}
      </select>
    </label>
    <label>Default city<input name="defaultCity" bind:value={settings.defaultCity} /></label>
    <label>Province/state<input name="defaultProvinceState" bind:value={settings.defaultProvinceState} /></label>
    <label>Country<input name="defaultCountry" bind:value={settings.defaultCountry} /></label>
    <label>Zip code<input name="defaultZipCode" bind:value={settings.defaultZipCode} /></label>
    <label>Default latitude<input name="defaultLatitude" type="number" step="any" bind:value={settings.defaultLatitude} /></label>
    <label>Default longitude<input name="defaultLongitude" type="number" step="any" bind:value={settings.defaultLongitude} /></label>
    <label>Distance unit<input value="km" disabled /></label>
    <label>Temperature unit<input value="celsius" disabled /></label>
    <label>Wind speed unit<input value="kmh" disabled /></label>
    <div class="actions full">
      <button class="button" type="submit"><Save size={18} />Save settings</button>
      {#if saved}<span class="muted">{saved}</span>{/if}
      {#if error}<span class="muted">{error}</span>{/if}
    </div>
  </form>
{/if}
