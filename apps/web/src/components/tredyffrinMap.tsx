import { useState } from "react";

import { MapVisualStyleControls } from "@/components/map-controls";
import { MapLocationMarker } from "@/components/map-marker";
import { Map, MapControls } from "@/components/ui/map";
import {
  getMapStylesForVisualStyle,
  getTerrainForVisualStyle,
} from "@/components/map-style-config";
import type { MapVisualStyleId } from "@/components/map-types";
import type { LocationRecord } from "@/lib/locations";

/** Tredyffrin area — MapLibre uses [longitude, latitude] (GeoJSON order). */
const TREDDYFFRIN_CENTER: [number, number] = [-75.4368, 40.0902];

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
      zoom={12}
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
