<script lang="ts">
  import { Chart, BarController, BarElement, CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";
  import { onDestroy } from "svelte";

  Chart.register(BarController, BarElement, CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip);

  interface DistanceChartPoint {
    label: string;
    distanceKm: number;
    averageSpeedKmh: number | null;
    maxSpeedKmh: number | null;
  }

  let {
    ariaLabel,
    averageSpeedColor = "#17201b",
    barColor = "#1c7c54",
    maxSpeedColor = "#b64232",
    points,
    showAverageSpeed,
    showMaxSpeed
  }: {
    ariaLabel: string;
    averageSpeedColor?: string;
    barColor?: string;
    maxSpeedColor?: string;
    points: DistanceChartPoint[];
    showAverageSpeed: boolean;
    showMaxSpeed: boolean;
  } = $props();
  let canvas: HTMLCanvasElement;
  let chart: Chart | undefined;

  function renderChart() {
    const hasSpeedAxis = showAverageSpeed || showMaxSpeed;
    chart?.destroy();
    chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: points.map((point) => point.label),
        datasets: [
          {
            label: "Distance",
            data: points.map((point) => point.distanceKm),
            backgroundColor: barColor,
            borderRadius: 6,
            order: 2,
            yAxisID: "distance"
          },
          ...(showAverageSpeed
            ? [
                {
                  type: "line" as const,
                  label: "Avg speed",
                  data: points.map((point) => point.averageSpeedKmh),
                  borderColor: averageSpeedColor,
                  backgroundColor: averageSpeedColor,
                  borderWidth: 2,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                  tension: 0.3,
                  spanGaps: true,
                  order: 1,
                  yAxisID: "speed"
                }
              ]
            : []),
          ...(showMaxSpeed
            ? [
                {
                  type: "line" as const,
                  label: "Max speed",
                  data: points.map((point) => point.maxSpeedKmh),
                  borderColor: maxSpeedColor,
                  backgroundColor: maxSpeedColor,
                  borderDash: [6, 5],
                  borderWidth: 2,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                  tension: 0.25,
                  spanGaps: true,
                  order: 0,
                  yAxisID: "speed"
                }
              ]
            : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: hasSpeedAxis, labels: { usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (item) => {
                const unit = item.dataset.yAxisID === "speed" ? "km/h" : "km";
                return `${item.dataset.label}: ${item.formattedValue} ${unit}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          distance: { beginAtZero: true, position: "left", ticks: { callback: (value) => `${value} km` } },
          speed: {
            beginAtZero: true,
            display: hasSpeedAxis,
            grid: { drawOnChartArea: false },
            position: "right",
            ticks: { callback: (value) => `${value} km/h` }
          }
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
  <canvas bind:this={canvas} aria-label={ariaLabel}></canvas>
</div>

<style>
  .chart-box {
    height: 340px;
  }
</style>
