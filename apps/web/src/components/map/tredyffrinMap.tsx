import { useState } from "react";

import { MapVisualStyleControls } from "@/components/map/map-controls";
import { MapLocationMarker } from "@/components/map/map-marker";
import { Map as MapRoot, MapControls } from "@/components/ui/map";
import {
  getMapStylesForVisualStyle,
  getTerrainForVisualStyle,
} from "@/components/map/map-style-config";
import type { MapVisualStyleId } from "@/components/map/map-types";
import type { MapLocationRecord } from "@/lib/locations";

/** Tredyffrin area — MapLibre uses [longitude, latitude] (GeoJSON order). */
const TREDDYFFRIN_CENTER: [number, number] = [-75.483168, 40.0402];

interface MapProps {
  locations: MapLocationRecord[];
}

export function TredyffrinMap({ locations }: MapProps) {
  const [selectedStyle, setSelectedStyle] =
    useState<MapVisualStyleId>("streets");
  const mapStyles = getMapStylesForVisualStyle(selectedStyle);
  const terrain3d = getTerrainForVisualStyle(selectedStyle);

  return (
    <MapRoot
      className="min-h-[320px] h-[55vh] max-h-128 sm:h-[60vh] md:h-[75vh] md:max-h-none"
      center={TREDDYFFRIN_CENTER}
      zoom={11}
      styles={mapStyles}
      terrain3d={terrain3d}
      canvasContextAttributes={{ antialias: true }}
    >
      <MapControls />
      <MapVisualStyleControls
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />
      {locations.map((location) => (
        <MapLocationMarker
          key={location.slug}
          location={location}
          mapVisualStyle={selectedStyle}
        />
      ))}
    </MapRoot>
  );
}
