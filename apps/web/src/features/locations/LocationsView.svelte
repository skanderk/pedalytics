<script lang="ts">
  import { onMount } from "svelte";
  import { Pencil, Plus, Trash2 } from "@lucide/svelte";
  import { pedalyticsApi, type Location, type LocationInput } from "../../lib/api/pedalyticsApi";
  import LocationForm from "./LocationForm.svelte";

  let locations = $state<Location[]>([]);
  let maybeEditedLocation = $state<Location | null>(null);
  let showForm = $state(false);
  let error = $state("");

  async function load() {
    locations = await pedalyticsApi.listLocations();
  }

  async function save(input: LocationInput) {
    try {
      if (maybeEditedLocation) await pedalyticsApi.updateLocation(maybeEditedLocation.id, input);
      else await pedalyticsApi.createLocation(input);
      showForm = false;
      maybeEditedLocation = null;
      await load();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "❌ Location could not be saved";
    }
  }

  async function remove(id: number) {
    await pedalyticsApi.deleteLocation(id);
    await load();
  }

  onMount(load);
</script>

<header class="view-header">
  <div>
    <h1>Locations</h1>
    <p class="muted">Reusable places for ride departures and destinations.</p>
  </div>
  <button class="button" onclick={() => { maybeEditedLocation = null; showForm = true; }}><Plus size={18} />New location</button>
</header>

{#if error}<div class="panel">{error}</div>{/if}
{#if showForm}
  {#key maybeEditedLocation?.id ?? "new"}
    <LocationForm location={maybeEditedLocation} onSave={save} onCancel={() => (showForm = false)} />
  {/key}
{/if}

<section class="panel">
  {#if locations.length}
    <table>
      <thead><tr><th>Name</th><th>Address</th><th>City</th><th>Coordinates</th><th></th></tr></thead>
      <tbody>
        {#each locations as location}
          <tr>
            <td>{location.name}</td>
            <td>{location.address ?? ""}</td>
            <td>{[location.city, location.provinceState].filter(Boolean).join(", ")}</td>
            <td>{location.latitude ?? "n/a"}, {location.longitude ?? "n/a"}</td>
            <td class="actions">
              <button class="button secondary" title="Edit location" onclick={() => { maybeEditedLocation = location; showForm = true; }}><Pencil size={16} /></button>
              <button class="button danger" title="Delete location" onclick={() => remove(location.id)}><Trash2 size={16} /></button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="empty-state">No locations yet.</div>
  {/if}
</section>
