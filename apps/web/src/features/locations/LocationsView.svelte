<script lang="ts">
  import { onMount } from "svelte";
  import { Eye, Pencil, Plus, Trash2 } from "@lucide/svelte";
  import { pedalyticsApi, type Location, type LocationInput } from "../../lib/api/pedalyticsApi";
  import LocationForm from "./LocationForm.svelte";

  let locations = $state<Location[]>([]);
  let maybeEditedLocation = $state<Location | null>(null);
  let selectedLocationId = $state<number | null>(null);
  let showForm = $state(false);
  let error = $state("");
  let saveError = $state("");

  const selectedLocation = $derived(locations.find((location) => location.id === selectedLocationId) ?? null);

  async function load() {
    try {
      error = "";
      locations = await pedalyticsApi.listLocations();
      if (selectedLocationId && !locations.some((location) => location.id === selectedLocationId)) {
        selectedLocationId = null;
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Locations could not be loaded";
    }
  }

  async function save(input: LocationInput) {
    try {
      saveError = "";
      const location = maybeEditedLocation
        ? await pedalyticsApi.updateLocation(maybeEditedLocation.id, input)
        : await pedalyticsApi.createLocation(input);
      selectedLocationId = location.id;
      showForm = false;
      maybeEditedLocation = null;
      await load();
    } catch (caught) {
      saveError = caught instanceof Error ? caught.message : "Location could not be saved";
    }
  }

  async function remove(id: number) {
    try {
      error = "";
      await pedalyticsApi.deleteLocation(id);
      if (selectedLocationId === id) selectedLocationId = null;
      await load();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Location could not be deleted";
    }
  }

  function openCreateForm() {
    maybeEditedLocation = null;
    saveError = "";
    showForm = true;
  }

  function openEditForm(location: Location) {
    maybeEditedLocation = location;
    selectedLocationId = location.id;
    saveError = "";
    showForm = true;
  }

  function toggleDetails(location: Location) {
    selectedLocationId = selectedLocationId === location.id ? null : location.id;
    showForm = false;
    saveError = "";
  }

  function rowKeydown(event: KeyboardEvent, location: Location) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleDetails(location);
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation();
  }

  function valueOrEmpty(value: string | number | null) {
    return value ?? "n/a";
  }

  function detailsMapUrl(location: Location) {
    if (location.latitude == null || location.longitude == null) return null;

    const padding = 0.01;
    const bbox = [
      location.longitude - padding,
      location.latitude - padding,
      location.longitude + padding,
      location.latitude + padding
    ].join(",");

    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
  }

  onMount(load);
</script>

<header class="view-header">
  <div>
    <h1>Locations</h1>
    <p class="muted">Reusable places for ride departures and destinations.</p>
  </div>
  <button class="button" onclick={openCreateForm}><Plus size={18} />New location</button>
</header>

{#if error}<div class="panel">{error}</div>{/if}
{#if showForm}
  {#key maybeEditedLocation?.id ?? "new"}
    <LocationForm location={maybeEditedLocation} error={saveError} onSave={save} onCancel={() => (showForm = false)} />
  {/key}
{/if}

<section class="panel">
  {#if locations.length}
    <table>
      <thead><tr><th>Name</th><th>Address</th><th>City</th><th>Coordinates</th><th></th></tr></thead>
      <tbody>
        {#each locations as location, index}
          <tr
            class:odd-location-row={index % 2 === 0}
            class:even-location-row={index % 2 === 1}
            class:selected-row={selectedLocationId === location.id}
            class="clickable-row"
            role="button"
            tabindex="0"
            aria-expanded={selectedLocationId === location.id}
            aria-controls={`location-details-${location.id}`}
            onclick={() => toggleDetails(location)}
            onkeydown={(event) => rowKeydown(event, location)}
          >
            <td>{location.name}</td>
            <td>{location.address ?? ""}</td>
            <td>{[location.city, location.provinceState].filter(Boolean).join(", ")}</td>
            <td>{location.latitude ?? "n/a"}, {location.longitude ?? "n/a"}</td>
            <td class="actions" onclick={stopRowClick}>
              <button class="button secondary" title="View location details" aria-label={`View details for ${location.name}`} onclick={() => toggleDetails(location)}><Eye size={16} /></button>
              <button class="button secondary" title="Edit location" aria-label={`Edit ${location.name}`} onclick={() => openEditForm(location)}><Pencil size={16} /></button>
              <button class="button danger" title="Delete location" aria-label={`Delete ${location.name}`} onclick={() => remove(location.id)}><Trash2 size={16} /></button>
            </td>
          </tr>
          {#if selectedLocation?.id === location.id}
            <tr class="details-row">
              <td colspan="5">
                <section class="location-details" id={`location-details-${location.id}`} aria-label={`Details for ${location.name}`}>
                  <div class="location-details-header">
                    <div>
                      <h2>{location.name}</h2>
                      <p class="muted">{[location.city, location.provinceState, location.country].filter(Boolean).join(", ")}</p>
                    </div>
                    <div class="actions">
                      <button class="button secondary" type="button" onclick={() => openEditForm(location)}><Pencil size={16} />Edit</button>
                    </div>
                  </div>
                  <dl class="detail-grid">
                    <div><dt>Address</dt><dd>{valueOrEmpty(location.address)}</dd></div>
                    <div><dt>City</dt><dd>{location.city}</dd></div>
                    <div><dt>Province/state</dt><dd>{valueOrEmpty(location.provinceState)}</dd></div>
                    <div><dt>Country</dt><dd>{location.country}</dd></div>
                    <div><dt>Zip code</dt><dd>{valueOrEmpty(location.zipCode)}</dd></div>
                    <div><dt>Latitude</dt><dd>{valueOrEmpty(location.latitude)}</dd></div>
                    <div><dt>Longitude</dt><dd>{valueOrEmpty(location.longitude)}</dd></div>
                  </dl>
                  {#if detailsMapUrl(location)}
                    <div class="location-map">
                      <iframe title={`Map for ${location.name}`} src={detailsMapUrl(location)}></iframe>
                    </div>
                  {/if}
                </section>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="empty-state">No locations yet.</div>
  {/if}
</section>
