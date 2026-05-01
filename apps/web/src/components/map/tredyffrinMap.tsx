import { useState } from "react";

import { MapVisualStyleControls } from "@/components/map/map-controls";
import { MapLocationMarker } from "@/components/map/map-marker";
import { Map, MapControls } from "@/components/ui/map";
import {
  getMapStylesForVisualStyle,
  getTerrainForVisualStyle,
} from "@/components/map/map-style-config";
import type { MapVisualStyleId } from "@/components/map/map-types";
import type { LocationRecord } from "@/lib/locations";

/** Tredyffrin area — MapLibre uses [longitude, latitude] (GeoJSON order). */
const TREDDYFFRIN_CENTER: [number, number] = [-75.483168, 40.0402];

interface MapProps {
  locations: LocationRecord[];
}

export function TredyffrinMap({ locations }: MapProps) {
  const [activePhotoTabs, setActivePhotoTabs] = useState<
    Record<string, string>
  >({});
  const [selectedStyle, setSelectedStyle] =
    useState<MapVisualStyleId>("terrain");
  const mapStyles = getMapStylesForVisualStyle(selectedStyle);
  const terrain3d = getTerrainForVisualStyle(selectedStyle);

  return (
    <Map
      className="min-h-[320px] h-[75vh]"
      center={TREDDYFFRIN_CENTER}
      zoom={11}
      styles={mapStyles}
      terrain3d={terrain3d}
    >
      <MapControls />
      <MapVisualStyleControls
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />
      {locations.map((location) => {
        const activeTab = activePhotoTabs[location.slug] ?? "1";

        return (
          <MapLocationMarker
            key={location.slug}
            location={location}
            mapVisualStyle={selectedStyle}
            activeTab={activeTab}
            onActiveTabChange={(nextTab) => {
              setActivePhotoTabs((prev) => ({
                ...prev,
                [location.slug]: nextTab,
              }));
            }}
          />
        );
      })}
    </Map>
  );
}
