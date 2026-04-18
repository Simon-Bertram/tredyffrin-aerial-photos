import { useEffect, useRef, type MutableRefObject } from "react";
import type MapLibreGL from "maplibre-gl";

import type { MapTerrainConfig } from "@/components/map/map-types";

type UseMapTerrainArgs = {
  map: MapLibreGL.Map | null;
  isStyleLoaded: boolean;
  terrain3d?: MapTerrainConfig;
  /**
   * Synchronous flag indicating a setStyle transition is in flight.
   * Prevents applying terrain on a map that is mid-swap, which would
   * leave MapLibre's painter without the terrain-depth program and
   * crash on the next render frame.
   */
  pendingStyleChangeRef?: MutableRefObject<boolean>;
};

const DEFAULT_SOURCE_ID = "terrain-dem";
const DEFAULT_HILLSHADE_SOURCE_ID = "terrain-hillshade-dem";
const DEFAULT_HILLSHADE_LAYER_ID = "terrain-hillshade";
const DEFAULT_SKY_LAYER_ID = "terrain-sky";
const DEFAULT_TERRAIN_EXAGGERATION = 1;

function removeLayerIfPresent(map: MapLibreGL.Map, layerId: string) {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

function removeTerrainArtifacts(
  map: MapLibreGL.Map,
  config: Pick<MapTerrainConfig, "sourceId" | "hillshade" | "sky">,
) {
  const terrainSourceId = config.sourceId ?? DEFAULT_SOURCE_ID;
  const hillshadeSourceId = `${terrainSourceId}-${DEFAULT_HILLSHADE_SOURCE_ID}`;
  const hillshadeLayerId =
    config.hillshade?.layerId ?? DEFAULT_HILLSHADE_LAYER_ID;
  const skyLayerId = config.sky?.layerId ?? DEFAULT_SKY_LAYER_ID;

  map.setTerrain(null);
  removeLayerIfPresent(map, hillshadeLayerId);
  removeLayerIfPresent(map, skyLayerId);

  if (map.getSource(hillshadeSourceId)) {
    map.removeSource(hillshadeSourceId);
  }
  if (map.getSource(terrainSourceId)) {
    map.removeSource(terrainSourceId);
  }
}

function ensureTerrainSource(
  map: MapLibreGL.Map,
  sourceId: string,
  source: MapTerrainConfig["source"],
) {
  if (map.getSource(sourceId)) {
    return;
  }

  if (!source.url && (!source.tiles || source.tiles.length === 0)) {
    return;
  }

  map.addSource(sourceId, {
    type: "raster-dem",
    ...source,
  } as MapLibreGL.RasterDEMSourceSpecification);
}

function ensureTerrainLayers(map: MapLibreGL.Map, terrain3d: MapTerrainConfig) {
  const terrainSourceId = terrain3d.sourceId ?? DEFAULT_SOURCE_ID;
  const hillshadeSourceId = `${terrainSourceId}-${DEFAULT_HILLSHADE_SOURCE_ID}`;
  const hillshadeLayerId =
    terrain3d.hillshade?.layerId ?? DEFAULT_HILLSHADE_LAYER_ID;
  const skyLayerId = terrain3d.sky?.layerId ?? DEFAULT_SKY_LAYER_ID;

  ensureTerrainSource(map, terrainSourceId, terrain3d.source);

  if (!map.getSource(terrainSourceId)) {
    return false;
  }

  map.setTerrain({
    source: terrainSourceId,
    exaggeration: terrain3d.exaggeration ?? DEFAULT_TERRAIN_EXAGGERATION,
  });

  if (terrain3d.hillshade?.enabled) {
    ensureTerrainSource(map, hillshadeSourceId, terrain3d.source);
    if (!map.getLayer(hillshadeLayerId)) {
      map.addLayer({
        id: hillshadeLayerId,
        type: "hillshade",
        source: hillshadeSourceId,
        paint: terrain3d.hillshade.shadowColor
          ? {
              "hillshade-shadow-color": terrain3d.hillshade.shadowColor,
            }
          : undefined,
      });
    }
  } else {
    removeLayerIfPresent(map, hillshadeLayerId);
    if (map.getSource(hillshadeSourceId)) {
      map.removeSource(hillshadeSourceId);
    }
  }

  if (terrain3d.sky?.enabled) {
    if (!map.getLayer(skyLayerId)) {
      try {
        const skyLayer = {
          id: skyLayerId,
          type: "sky",
        } as unknown as MapLibreGL.LayerSpecification;
        map.addLayer(skyLayer);
      } catch {
        // Some styles/runtimes do not support "sky" layers. Terrain still works without it.
      }
    }
  } else {
    removeLayerIfPresent(map, skyLayerId);
  }

  return true;
}

function useMapTerrain({
  map,
  isStyleLoaded,
  terrain3d,
  pendingStyleChangeRef,
}: UseMapTerrainArgs) {
  const hasAppliedInitialCameraRef = useRef(false);

  useEffect(() => {
    hasAppliedInitialCameraRef.current = false;
  }, [map, isStyleLoaded]);

  useEffect(() => {
    if (!map) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "223fd5",
          },
          body: JSON.stringify({
            sessionId: "223fd5",
            location: "use-map-terrain.ts:no-map",
            message: "terrain effect skip: no map",
            data: {},
            timestamp: Date.now(),
            hypothesisId: "H5",
          }),
        },
      ).catch(() => {});
      // #endregion
      return;
    }

    // A setStyle transition is in flight; don't touch terrain until the new
    // style finishes loading. Otherwise we call setTerrain on a map whose
    // painter is about to swap styles, leaving the terrain-depth program
    // unregistered and crashing the next render frame.
    if (pendingStyleChangeRef?.current) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "223fd5",
          },
          body: JSON.stringify({
            sessionId: "223fd5",
            location: "use-map-terrain.ts:pending-style",
            message: "terrain effect skip: pending style change",
            data: {
              reactIsStyleLoaded: isStyleLoaded,
              mapIsStyleLoaded: map.isStyleLoaded(),
            },
            timestamp: Date.now(),
            hypothesisId: "H4",
          }),
        },
      ).catch(() => {});
      // #endregion
      return;
    }

    if (!terrain3d) {
      if (map.isStyleLoaded()) {
        removeTerrainArtifacts(map, {});
      }
      return;
    }

    if (!isStyleLoaded) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "223fd5",
          },
          body: JSON.stringify({
            sessionId: "223fd5",
            location: "use-map-terrain.ts:react-not-loaded",
            message: "terrain effect skip: react isStyleLoaded false",
            data: {
              mapIsStyleLoaded: map.isStyleLoaded(),
              terrainEnabled: terrain3d.enabled,
            },
            timestamp: Date.now(),
            hypothesisId: "H3",
          }),
        },
      ).catch(() => {});
      // #endregion
      return;
    }
    if (!map.isStyleLoaded()) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "223fd5",
          },
          body: JSON.stringify({
            sessionId: "223fd5",
            location: "use-map-terrain.ts:map-not-style-loaded",
            message:
              "terrain effect skip: map.isStyleLoaded false while react true",
            data: { reactIsStyleLoaded: isStyleLoaded },
            timestamp: Date.now(),
            hypothesisId: "H1",
          }),
        },
      ).catch(() => {});
      // #endregion
      return;
    }

    if (!terrain3d.enabled) {
      removeTerrainArtifacts(map, terrain3d);
      return;
    }

    // #region agent log
    fetch("http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "223fd5",
      },
      body: JSON.stringify({
        sessionId: "223fd5",
        location: "use-map-terrain.ts:before-ensure",
        message: "terrain effect applying layers",
        data: {
          reactIsStyleLoaded: isStyleLoaded,
          mapIsStyleLoaded: map.isStyleLoaded(),
          hasDemBefore: Boolean(map.getSource("terrain-dem")),
        },
        timestamp: Date.now(),
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion

    const hasTerrain = ensureTerrainLayers(map, terrain3d);

    // #region agent log
    fetch("http://127.0.0.1:7782/ingest/2b0c5321-63a0-48fd-9d23-b9365f9aa9d7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "223fd5",
      },
      body: JSON.stringify({
        sessionId: "223fd5",
        location: "use-map-terrain.ts:after-ensure",
        message: "ensureTerrainLayers result",
        data: {
          hasTerrain,
          hasDemAfter: Boolean(map.getSource("terrain-dem")),
          terrainSpec: Boolean(map.getTerrain()),
        },
        timestamp: Date.now(),
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion
    if (!hasTerrain || hasAppliedInitialCameraRef.current) {
      return;
    }

    const { initialCamera } = terrain3d;
    const pitch = initialCamera?.pitch;
    const bearing = initialCamera?.bearing;
    const duration = initialCamera?.duration ?? 700;

    if (pitch === undefined && bearing === undefined) {
      hasAppliedInitialCameraRef.current = true;
      return;
    }

    map.easeTo({
      pitch: pitch ?? map.getPitch(),
      bearing: bearing ?? map.getBearing(),
      duration,
    });
    hasAppliedInitialCameraRef.current = true;
  }, [map, isStyleLoaded, terrain3d, pendingStyleChangeRef]);
}

export { useMapTerrain };
export { ensureTerrainLayers, removeTerrainArtifacts };
