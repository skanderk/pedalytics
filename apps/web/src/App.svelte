<script lang="ts">
  import { BarChart3, Bike, MapPin, Settings } from "@lucide/svelte";
  import DashboardView from "./features/dashboard/DashboardView.svelte";
  import RidesView from "./features/rides/RidesView.svelte";
  import LocationsView from "./features/locations/LocationsView.svelte";
  import SettingsView from "./features/settings/SettingsView.svelte";

  type Page = "dashboard" | "rides" | "locations" | "settings";

  let activePage = $state<Page>("dashboard");

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "rides" as const, label: "Rides", icon: Bike },
    { id: "locations" as const, label: "Locations", icon: MapPin },
    { id: "settings" as const, label: "Settings", icon: Settings }
  ];
</script>

<main class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">P</div>
      <div>
        <strong>Pedalytics</strong>
        <span>Ride journal</span>
      </div>
    </div>

    <nav>
      {#each navItems as item}
        <button class:active={activePage === item.id} onclick={() => (activePage = item.id)}>
          <item.icon size={18} />
          {item.label}
        </button>
      {/each}
    </nav>
  </aside>

  <section class="content">
    {#if activePage === "dashboard"}
      <DashboardView />
    {:else if activePage === "rides"}
      <RidesView />
    {:else if activePage === "locations"}
      <LocationsView />
    {:else}
      <SettingsView />
    {/if}
  </section>
</main>
