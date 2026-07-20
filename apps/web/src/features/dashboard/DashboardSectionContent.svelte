<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="section-content">
  {@render children()}
</div>

<style>
  .section-content {
    min-width: 0;
  }
</style>
