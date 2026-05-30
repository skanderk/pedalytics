<script lang="ts">
  import type { Location } from "../../lib/api/pedalyticsApi";

  interface RoutePoint {
    label: "D" | "A";
    name: string;
    latitude: number;
    longitude: number;
  }

  interface ProjectedRoutePoint extends RoutePoint {
    x: number;
    y: number;
  }

  const tileSize = 256;
  const viewHeight = 320;
  const minZoom = 2;
  const maxZoom = 16;

  let {
    departure = null,
    destination = null,
    distanceKm = null
  }: {
    departure?: Location | null;
    destination?: Location | null;
    distanceKm?: number | null;
  } = $props();

  let containerWidth = $state(1000);
  let zoom = $state(13);
  let center = $state({ x: 0, y: 0 });
  let activeRouteKey = $state("");
  let drag = $state<{ pointerId: number; x: number; y: number } | null>(null);

  let viewWidth = $derived(Math.max(360, containerWidth || 1000));
  let points = $derived(
    [
      mapPoint("D", departure),
      mapPoint("A", destination)
    ].filter((point): point is RoutePoint => point !== null)
  );
  let routeKey = $derived(points.map((point) => `${point.label}:${point.latitude},${point.longitude}`).join("|"));
  let map = $derived(buildMap(points, viewWidth, center, zoom));
  let distanceLabel = $derived(formatDistanceLabel(distanceKm));

  $effect(() => {
    if (!routeKey || activeRouteKey === routeKey) return;

    const fitted = fitView(points, viewWidth);
    activeRouteKey = routeKey;
    zoom = fitted.zoom;
    center = fitted.center;
  });

  function mapPoint(label: RoutePoint["label"], location: Location | null | undefined): RoutePoint | null {
    if (location?.latitude == null || location.longitude == null) {
      return null;
    }

    return {
      label,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function scaleFor(zoomLevel: number) {
    return tileSize * 2 ** zoomLevel;
  }

  function project(latitude: number, longitude: number, zoomLevel: number) {
    const sinLatitude = Math.sin((clamp(latitude, -85.05112878, 85.05112878) * Math.PI) / 180);
    const scale = scaleFor(zoomLevel);

    return {
      x: ((longitude + 180) / 360) * scale,
      y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale
    };
  }

  function fitZoom(routePoints: RoutePoint[], width: number) {
    if (routePoints.length < 2) {
      return 13;
    }

    const projectedAtZero = routePoints.map((point) => project(point.latitude, point.longitude, 0));
    const minX = Math.min(...projectedAtZero.map((point) => point.x));
    const maxX = Math.max(...projectedAtZero.map((point) => point.x));
    const minY = Math.min(...projectedAtZero.map((point) => point.y));
    const maxY = Math.max(...projectedAtZero.map((point) => point.y));
    const spanWidth = Math.max(maxX - minX, 0.0001);
    const spanHeight = Math.max(maxY - minY, 0.0001);
    const scale = Math.min(Math.max(width - 180, 180) / spanWidth, (viewHeight - 120) / spanHeight);

    return clamp(Math.floor(Math.log2(scale)), minZoom, maxZoom);
  }

  function fitView(routePoints: RoutePoint[], width: number) {
    const fittedZoom = fitZoom(routePoints, width);
    const projected = routePoints.map((point) => project(point.latitude, point.longitude, fittedZoom));

    return {
      zoom: fittedZoom,
      center: constrainCenter(
        {
          x: (Math.min(...projected.map((point) => point.x)) + Math.max(...projected.map((point) => point.x))) / 2,
          y: (Math.min(...projected.map((point) => point.y)) + Math.max(...projected.map((point) => point.y))) / 2
        },
        fittedZoom,
        width
      )
    };
  }

  function constrainCenter(nextCenter: { x: number; y: number }, zoomLevel: number, width: number) {
    const scale = scaleFor(zoomLevel);
    return {
      x: ((nextCenter.x % scale) + scale) % scale,
      y: clamp(nextCenter.y, viewHeight / 2, Math.max(viewHeight / 2, scale - viewHeight / 2))
    };
  }

  function buildMap(routePoints: RoutePoint[], width: number, centerPoint: { x: number; y: number }, zoomLevel: number) {
    if (routePoints.length === 0 || centerPoint.x === 0) {
      return null;
    }

    const maxTile = 2 ** zoomLevel - 1;
    const tileMinX = Math.floor((centerPoint.x - width / 2) / tileSize);
    const tileMaxX = Math.floor((centerPoint.x + width / 2) / tileSize);
    const tileMinY = Math.max(0, Math.floor((centerPoint.y - viewHeight / 2) / tileSize));
    const tileMaxY = Math.min(maxTile, Math.floor((centerPoint.y + viewHeight / 2) / tileSize));
    const tiles = [];

    for (let tileX = tileMinX; tileX <= tileMaxX; tileX += 1) {
      const wrappedTileX = ((tileX % (maxTile + 1)) + maxTile + 1) % (maxTile + 1);
      for (let tileY = tileMinY; tileY <= tileMaxY; tileY += 1) {
        tiles.push({
          key: `${zoomLevel}-${wrappedTileX}-${tileY}`,
          url: `https://tile.openstreetmap.org/${zoomLevel}/${wrappedTileX}/${tileY}.png`,
          left: tileX * tileSize - centerPoint.x + width / 2,
          top: tileY * tileSize - centerPoint.y + viewHeight / 2
        });
      }
    }

    const markers = routePoints.map((point): ProjectedRoutePoint => {
      const projected = project(point.latitude, point.longitude, zoomLevel);
      return {
        ...point,
        x: projected.x - centerPoint.x + width / 2,
        y: projected.y - centerPoint.y + viewHeight / 2
      };
    });

    return {
      markers,
      tiles,
      line: markers.length === 2 ? markers : null,
      labelPosition: markers.length === 2 ? routeLabelPosition(markers[0], markers[1]) : null
    };
  }

  function formatDistanceLabel(distance: number | null | undefined) {
    if (distance == null || !Number.isFinite(distance) || distance <= 0) {
      return null;
    }

    return `${Math.round(distance)} km`;
  }

  function routeLabelPosition(start: ProjectedRoutePoint, end: ProjectedRoutePoint) {
    const middle = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const offset = 18;

    return {
      x: middle.x + (-dy / length) * offset,
      y: middle.y + (dx / length) * offset
    };
  }

  function panBy(deltaX: number, deltaY: number) {
    center = constrainCenter({ x: center.x - deltaX, y: center.y - deltaY }, zoom, viewWidth);
  }

  function zoomBy(delta: number) {
    const nextZoom = clamp(zoom + delta, minZoom, maxZoom);
    if (nextZoom === zoom) return;

    const ratio = 2 ** (nextZoom - zoom);
    center = constrainCenter({ x: center.x * ratio, y: center.y * ratio }, nextZoom, viewWidth);
    zoom = nextZoom;
  }

  function handlePointerDown(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;

    panBy(event.clientX - drag.x, event.clientY - drag.y);
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function handlePointerEnd(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) {
      drag = null;
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1 : -1);
  }
</script>

{#if map}
  <div
    class={`route-map full ${drag ? "dragging" : ""}`}
    bind:clientWidth={containerWidth}
    role="application"
    aria-label="Ride route map"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerEnd}
    onpointercancel={handlePointerEnd}
    onwheel={handleWheel}
  >
    <svg class="route-map-canvas" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="none" aria-hidden="true">
      {#each map.tiles as tile (tile.key)}
        <image href={tile.url} x={tile.left} y={tile.top} width={tileSize} height={tileSize} preserveAspectRatio="none" />
      {/each}
      {#if map.line}
        <line x1={map.line[0].x} y1={map.line[0].y} x2={map.line[1].x} y2={map.line[1].y} />
      {/if}
      {#if distanceLabel && map.labelPosition}
        <g class="route-distance-label" transform={`translate(${map.labelPosition.x} ${map.labelPosition.y})`}>
          <rect x="-32" y="-14" width="64" height="28" rx="6" />
          <text y="5" text-anchor="middle">{distanceLabel}</text>
        </g>
      {/if}
      {#each map.markers as marker}
        <g class={`route-marker ${marker.label === "D" ? "departure" : "destination"}`} transform={`translate(${marker.x} ${marker.y})`}>
          <path d="M0 -34C-10 -34 -18 -26 -18 -16C-18 -3 0 18 0 18C0 18 18 -3 18 -16C18 -26 10 -34 0 -34Z" />
          <circle cy="-16" r="10" />
          <text y="-12" text-anchor="middle">{marker.label}</text>
          <title>{marker.label === "D" ? "Departure" : "Destination"}: {marker.name}</title>
        </g>
      {/each}
    </svg>
    <div class="route-map-controls">
      <button type="button" aria-label="Zoom in" onclick={() => zoomBy(1)}>+</button>
      <button type="button" aria-label="Zoom out" onclick={() => zoomBy(-1)}>−</button>
    </div>
    <a class="route-map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
      OpenStreetMap
    </a>
  </div>
{/if}
