<script lang="ts">
  import type { Snippet } from "svelte";
  import type { DashboardSummary } from "../../lib/api/pedalyticsApi";
  import DashboardSectionContent from "./DashboardSectionContent.svelte";
  import DashboardSectionHeader from "./DashboardSectionHeader.svelte";

  let {
    children,
    class: className = "",
    stats,
    subtitle,
    title,
    tone
  }: {
    children: Snippet;
    class?: string;
    stats: DashboardSummary;
    subtitle?: string;
    title: string;
    tone: "daily" | "monthly" | "yearly" | "global";
  } = $props();
</script>

<section class={`dashboard-section dashboard-section-${tone} ${className}`}>
  <DashboardSectionHeader {stats} {subtitle} {title} />
  <DashboardSectionContent>
    {@render children()}
  </DashboardSectionContent>
</section>

<style>
  .dashboard-section {
    --section-bg:
      radial-gradient(circle at top left, rgba(28, 124, 84, 0.14), transparent 34%),
      linear-gradient(135deg, #f3fbef 0%, #ffffff 58%, #eef8eb 100%);
    --section-border: #cfe2c6;
    --section-heading: #1c7c54;
    --section-stat-border: rgba(28, 124, 84, 0.2);
    --section-stat-glow: rgba(28, 124, 84, 0.12);
    display: grid;
    gap: 18px;
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--section-border);
    border-radius: 8px;
    background: var(--section-bg);
    box-shadow:
      0 16px 32px rgba(23, 32, 27, 0.08),
      0 2px 6px rgba(23, 32, 27, 0.04);
  }

  .dashboard-section-monthly {
    --section-bg:
      radial-gradient(circle at top left, rgba(47, 111, 159, 0.14), transparent 34%),
      linear-gradient(135deg, #eef8fd 0%, #ffffff 58%, #edf6fb 100%);
    --section-border: #c9dce8;
    --section-heading: #2f6f9f;
    --section-stat-border: rgba(47, 111, 159, 0.22);
    --section-stat-glow: rgba(47, 111, 159, 0.12);
  }

  .dashboard-section-yearly,
  .dashboard-section-global {
    --section-bg:
      radial-gradient(circle at top left, rgba(138, 111, 42, 0.16), transparent 34%),
      linear-gradient(135deg, #fff6db 0%, #ffffff 58%, #fbf3df 100%);
    --section-border: #e5d8ad;
    --section-heading: #77601f;
    --section-stat-border: rgba(138, 111, 42, 0.22);
    --section-stat-glow: rgba(138, 111, 42, 0.14);
  }
</style>
