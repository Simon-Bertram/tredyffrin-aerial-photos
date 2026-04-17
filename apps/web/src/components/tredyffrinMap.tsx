import { useState } from "react";

// import { AerialMapControls } from "@/components/aerial-map-controls";
// import { AerialMapMarker } from "@/components/aerial-map-marker";
import { Map, MapMarker } from "@/components/ui/map";
import {
  getMapStylesForVisualStyle,
  getTerrainForVisualStyle,
} from "@/components/map-style-config";
import type {
  MapTerrainConfig,
  MapVisualStyleId,
} from "@/components/map-types";
import type { LocationRecord } from "@/lib/locations";
import { MapStyleControls } from "@/components/map-style-controls";
import { useMapTerrain } from "@/components/use-map-terrain";
import { MapControls } from "@/components/map-controls";

/** Tredyffrin area — MapLibre uses [longitude, latitude] (GeoJSON order). */
const TREDDYFFRIN_CENTER: [number, number] = [-75.4368, 40.0902];

interface AerialMapProps {
  locations: LocationRecord[];
}

export function TredyffrinMap({ locations }: AerialMapProps) {
  const [activePhotoTabs, setActivePhotoTabs] = useState<
    Record<string, string>
  >({});
  const [selectedStyle, setSelectedStyle] =
    useState<MapVisualStyleId>("terrain");
  const mapStyles = getMapStylesForVisualStyle(selectedStyle);
  const terrain3d = getTerrainForVisualStyle(selectedStyle);

  return (
    <Map
      center={TREDDYFFRIN_CENTER}
      zoom={11}
      styles={mapStyles}
      terrain3d={terrain3d}
    >
      <MapControls
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
      />
      {locations.map((location) => {
        const activeTab = activePhotoTabs[location.slug] ?? "1";

        return (
          <MapMarker
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
