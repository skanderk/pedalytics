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
      useMetricSystem: data.has("useMetricSystem")
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
    <p class="muted">Home location and unit preference.</p>
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
    <label class="checkbox-field">
      <input name="useMetricSystem" type="checkbox" bind:checked={settings.useMetricSystem} />
      <span>Use metric system</span>
    </label>
    <div class="actions full">
      <button class="button" type="submit"><Save size={18} />Save settings</button>
      {#if saved}<span class="muted">{saved}</span>{/if}
      {#if error}<span class="muted">{error}</span>{/if}
    </div>
  </form>
{/if}
