<script lang="ts">
  import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
  import { onDestroy } from "svelte";
  import type { DashboardStats } from "../../lib/api/pedalyticsApi";

  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

  let { points }: { points: DashboardStats["distanceByDay"] } = $props();
  let canvas: HTMLCanvasElement;
  let chart: Chart | undefined;

  function renderChart() {
    chart?.destroy();
    chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: points.map((point) => point.rideDate),
        datasets: [
          {
            data: points.map((point) => point.distanceKm),
            backgroundColor: "#1c7c54",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { callbacks: { label: (item) => `${item.formattedValue} km` } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { callback: (value) => `${value} km` } }
        }
      }
    });
  }

  $effect(() => {
    if (canvas) renderChart();
  });
  onDestroy(() => chart?.destroy());
</script>

<div class="chart-box">
  <canvas bind:this={canvas} aria-label="Distance by day chart"></canvas>
</div>

<style>
  .chart-box {
    height: 340px;
  }
</style>
